import Foundation
import SwiftData

@Model
final class DataStorageItem {
    @Attribute(.unique) var key: String
    // Must use Data for SwiftData, but we'll minimize serialization overhead
    @Attribute(.externalStorage) var data: Data
    var timestamp: Date
    
    init(key: String, data: Data) {
        self.key = key
        self.data = data
        self.timestamp = Date()
    }
}
