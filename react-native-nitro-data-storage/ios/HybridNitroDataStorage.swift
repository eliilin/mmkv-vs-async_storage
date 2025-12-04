import Foundation
import SwiftData

/**
 * Swift implementation of NitroDataStorage using SwiftData
 */
@objc(HybridNitroDataStorage)
public class HybridNitroDataStorage: NSObject {
  private let manager: DataStorageManager
  
  @objc
  public var memorySize: Int {
    return MemoryLayout<HybridNitroDataStorage>.size
  }
  
  public override init() {
    self.manager = DataStorageManager.shared
    super.init()
  }
  
  @objc
  public func setItem(key: String, value: [String: Any]) throws {
    guard !key.isEmpty else {
      let error = NSError(
        domain: "NitroDataStorage",
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Key cannot be empty"]
      )
      throw error
    }
    
    try manager.setItem(key: key, value: value)
  }
  
  @objc
  public func getItem(key: String, error: NSErrorPointer) -> [String: Any]? {
    do {
      return try manager.getItem(key: key)
    } catch let err as NSError {
      error?.pointee = err
      return nil
    }
  }
  
  @objc
  public func removeItem(key: String, error: NSErrorPointer) -> NSNumber {
    guard !key.isEmpty else {
      return NSNumber(value: false)
    }
    
    do {
      try manager.removeItem(key: key)
      return NSNumber(value: true)
    } catch let err as NSError {
      error?.pointee = err
      return NSNumber(value: false)
    }
  }
  
  @objc
  public func getAllKeys(error: NSErrorPointer) -> [String]? {
    do {
      return try manager.getAllKeys()
    } catch let err as NSError {
      error?.pointee = err
      return nil
    }
  }
  
  @objc
  public func clear(error: NSErrorPointer) {
    do {
      try manager.clear()
    } catch let err as NSError {
      error?.pointee = err
    }
  }
  
  @objc
  public func contains(key: String, error: NSErrorPointer) -> NSNumber {
    do {
      let item = try manager.getItem(key: key)
      return NSNumber(value: item != nil)
    } catch let err as NSError {
      error?.pointee = err
      return NSNumber(value: false)
    }
  }
  
  @objc
  public var count: Double {
    do {
      let keys = try manager.getAllKeys()
      return Double(keys.count)
    } catch {
      return 0
    }
  }
  
  @objc
  public func dispose() {
    // No resources to dispose
  }
  
  @objc
  public func toString() -> String {
    return "[NitroDataStorage]"
  }
}
