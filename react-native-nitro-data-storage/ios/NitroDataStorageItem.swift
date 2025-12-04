import Foundation
import SwiftData

@Model
final class NitroDataStorageItem {
    @Attribute(.unique) var key: String
    @Attribute(.externalStorage) var data: Data
    var timestamp: Date
    
    init(key: String, data: Data) {
        self.key = key
        self.data = data
        self.timestamp = Date()
    }
}
