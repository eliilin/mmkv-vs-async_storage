import Foundation

/// High-performance file-based storage manager
/// Uses direct file I/O instead of database, similar to MMKV approach
@objc(DataStorageManagerFileIO)
public class DataStorageManagerFileIO: NSObject {
    @objc public static let shared = DataStorageManagerFileIO()
    
    // Storage directory
    private let storageDirectory: URL
    
    // In-memory cache for faster access
    private var cache: [String: Data] = [:]
    private let cacheQueue = DispatchQueue(label: "com.datastorage.fileio.cache", attributes: .concurrent)
    
    // File I/O queue for thread-safe operations
    private let ioQueue = DispatchQueue(label: "com.datastorage.fileio", qos: .userInitiated)
    
    // Pending writes for batch optimization
    private var pendingWrites: [String: Data] = [:]
    private var writeTimer: Timer?
    private let autoSaveDelay: TimeInterval = 0.3
    
    private override init() {
        // Create storage directory in Documents
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        storageDirectory = documentsPath.appendingPathComponent("DataStorage", isDirectory: true)
        
        super.init()
        
        // Create directory if it doesn't exist
        try? FileManager.default.createDirectory(at: storageDirectory, withIntermediateDirectories: true)
        
        // Load existing keys into cache
        loadCache()
    }
    
    // MARK: - Cache Management
    
    private func loadCache() {
        ioQueue.async { [weak self] in
            guard let self = self else { return }
            
            do {
                let files = try FileManager.default.contentsOfDirectory(at: self.storageDirectory, includingPropertiesForKeys: nil)
                
                var tempCache: [String: Data] = [:]
                for fileURL in files {
                    let key = fileURL.lastPathComponent
                    if let data = try? Data(contentsOf: fileURL) {
                        tempCache[key] = data
                    }
                }
                
                self.cacheQueue.async(flags: .barrier) {
                    self.cache = tempCache
                }
                
                print("✅ DataStorage: Loaded \(tempCache.count) items into cache")
            } catch {
                print("❌ DataStorage: Failed to load cache: \(error)")
            }
        }
    }
    
    // MARK: - File Paths
    
    private func fileURL(for key: String) -> URL {
        // Use sanitized key as filename
        let sanitizedKey = key.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? key
        return storageDirectory.appendingPathComponent(sanitizedKey)
    }
    
    // MARK: - Storage Operations
    
    @objc public func setItem(key: String, value: Any) throws {
        // Validate and serialize
        guard JSONSerialization.isValidJSONObject(value) else {
            throw NSError(domain: "DataStorage", code: -2, userInfo: [
                NSLocalizedDescriptionKey: "Invalid JSON object for key '\(key)'"
            ])
        }
        
        let data = try JSONSerialization.data(withJSONObject: value, options: [])
        
        // Update cache immediately
        cacheQueue.async(flags: .barrier) { [weak self] in
            self?.cache[key] = data
        }
        
        // Schedule write
        ioQueue.async { [weak self] in
            self?.pendingWrites[key] = data
            self?.scheduleWrite()
        }
    }
    
    @objc public func getItem(key: String) throws -> Any {
        // Check cache first
        var cachedData: Data?
        cacheQueue.sync {
            cachedData = cache[key]
        }
        
        if let data = cachedData {
            return try JSONSerialization.jsonObject(with: data, options: [])
        }
        
        // Try to read from file
        let fileURL = fileURL(for: key)
        
        return try ioQueue.sync {
            guard FileManager.default.fileExists(atPath: fileURL.path) else {
                return NSNull()
            }
            
            let data = try Data(contentsOf: fileURL)
            
            // Update cache
            cacheQueue.async(flags: .barrier) { [weak self] in
                self?.cache[key] = data
            }
            
            return try JSONSerialization.jsonObject(with: data, options: [])
        }
    }
    
    @objc public func removeItem(key: String) throws {
        // Remove from cache
        cacheQueue.async(flags: .barrier) { [weak self] in
            self?.cache.removeValue(forKey: key)
        }
        
        // Delete file
        try ioQueue.sync {
            let fileURL = fileURL(for: key)
            if FileManager.default.fileExists(atPath: fileURL.path) {
                try FileManager.default.removeItem(at: fileURL)
            }
        }
    }
    
    @objc public func getAllKeys() throws -> [String] {
        return try ioQueue.sync {
            let files = try FileManager.default.contentsOfDirectory(at: storageDirectory, includingPropertiesForKeys: nil)
            return files.map { $0.lastPathComponent }
        }
    }
    
    @objc public func clear() throws {
        // Clear cache
        cacheQueue.async(flags: .barrier) { [weak self] in
            self?.cache.removeAll()
        }
        
        // Delete all files
        try ioQueue.sync {
            let files = try FileManager.default.contentsOfDirectory(at: storageDirectory, includingPropertiesForKeys: nil)
            for fileURL in files {
                try FileManager.default.removeItem(at: fileURL)
            }
        }
    }
    
    // MARK: - Batch Operations
    
    @objc public func setItems(_ items: [String: Any]) throws {
        var dataItems: [String: Data] = [:]
        
        // Serialize all items first
        for (key, value) in items {
            guard JSONSerialization.isValidJSONObject(value) else {
                throw NSError(domain: "DataStorage", code: -2, userInfo: [
                    NSLocalizedDescriptionKey: "Invalid JSON object for key '\(key)'"
                ])
            }
            
            let data = try JSONSerialization.data(withJSONObject: value, options: [])
            dataItems[key] = data
        }
        
        // Update cache
        cacheQueue.async(flags: .barrier) { [weak self] in
            for (key, data) in dataItems {
                self?.cache[key] = data
            }
        }
        
        // Write all files (batched I/O)
        try ioQueue.sync { [weak self] in
            guard let self = self else { return }
            
            for (key, data) in dataItems {
                let fileURL = self.fileURL(for: key)
                try data.write(to: fileURL, options: .atomic)
            }
        }
    }
    
    // MARK: - Write Scheduling
    
    private func scheduleWrite() {
        // This runs on ioQueue
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.writeTimer?.invalidate()
            self.writeTimer = Timer.scheduledTimer(withTimeInterval: self.autoSaveDelay, repeats: false) { [weak self] _ in
                self?.flushPendingWrites()
            }
        }
    }
    
    private func flushPendingWrites() {
        ioQueue.async { [weak self] in
            guard let self = self else { return }
            
            let writes = self.pendingWrites
            self.pendingWrites.removeAll()
            
            for (key, data) in writes {
                let fileURL = self.fileURL(for: key)
                do {
                    try data.write(to: fileURL, options: .atomic)
                } catch {
                    print("❌ DataStorage: Failed to write key '\(key)': \(error)")
                }
            }
        }
    }
    
    @objc public func flushImmediately() {
        ioQueue.sync { [weak self] in
            guard let self = self else { return }
            
            let writes = self.pendingWrites
            self.pendingWrites.removeAll()
            
            for (key, data) in writes {
                let fileURL = self.fileURL(for: key)
                do {
                    try data.write(to: fileURL, options: .atomic)
                } catch {
                    print("❌ DataStorage: Failed to write key '\(key)': \(error)")
                }
            }
        }
    }
}
