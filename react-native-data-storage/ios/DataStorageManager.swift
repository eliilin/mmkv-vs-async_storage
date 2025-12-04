import Foundation
import SwiftData

@available(iOS 17.0, *)
@objc(DataStorageManager)
public class DataStorageManager: NSObject {
    @objc public static let shared = DataStorageManager()
    
    private var modelContainer: ModelContainer?
    private var modelContext: ModelContext?
    
    private override init() {
        super.init()
        setupContainer()
    }
    
    private func setupContainer() {
        do {
            let schema = Schema([DataStorageItem.self])
            let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            modelContainer = try ModelContainer(for: schema, configurations: [modelConfiguration])
            modelContext = ModelContext(modelContainer!)
        } catch {
            print("❌ DataStorage: Failed to initialize SwiftData container: \(error)")
        }
    }
    
    func save() throws {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        try context.save()
    }
    
    // MARK: - Storage Operations
    
    @objc public func setItem(key: String, value: Any) throws {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        
        // Convert to dictionary and serialize to Data
        guard let dict = value as? [String: Any] else {
            throw NSError(domain: "DataStorage", code: -2, userInfo: [
                NSLocalizedDescriptionKey: "Value must be a dictionary [String: Any]"
            ])
        }
        
        // Serialize to Data
        let data = try JSONSerialization.data(withJSONObject: dict, options: [])
        
        // Check if item exists
        let descriptor = FetchDescriptor<DataStorageItem>(
            predicate: #Predicate { $0.key == key }
        )
        
        let existingItems = try context.fetch(descriptor)
        
        if let existingItem = existingItems.first {
            // Update existing item
            existingItem.data = data
            existingItem.timestamp = Date()
        } else {
            // Create new item
            let newItem = DataStorageItem(key: key, data: data)
            context.insert(newItem)
        }
        
        try save()
    }
    
    @objc public func getItem(key: String) throws -> Any {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        
        let descriptor = FetchDescriptor<DataStorageItem>(
            predicate: #Predicate { $0.key == key }
        )
        
        let items = try context.fetch(descriptor)
        
        guard let item = items.first else {
            return NSNull()
        }
        
        // Deserialize Data back to dictionary
        let value = try JSONSerialization.jsonObject(with: item.data, options: [])
        return value
    }
    
    @objc public func removeItem(key: String) throws {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        
        let descriptor = FetchDescriptor<DataStorageItem>(
            predicate: #Predicate { $0.key == key }
        )
        
        let items = try context.fetch(descriptor)
        
        for item in items {
            context.delete(item)
        }
        
        try save()
    }
    
    @objc public func getAllKeys() throws -> [String] {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        
        let descriptor = FetchDescriptor<DataStorageItem>()
        let items = try context.fetch(descriptor)
        
        return items.map { $0.key }
    }
    
    @objc public func clear() throws {
        guard let context = modelContext else {
            throw NSError(domain: "DataStorage", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model context not initialized"])
        }
        
        let descriptor = FetchDescriptor<DataStorageItem>()
        let items = try context.fetch(descriptor)
        
        for item in items {
            context.delete(item)
        }
        
        try save()
    }
}
