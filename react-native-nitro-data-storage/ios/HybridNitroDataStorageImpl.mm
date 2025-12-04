//
//  HybridNitroDataStorageImpl.mm
//  NitroDataStorage
//

#import "HybridNitroDataStorageSpec.hpp"
#import <Foundation/Foundation.h>
#import <NitroModules/AnyMap.hpp>

#if __has_include("NitroDataStorage-Swift.h")
#import "NitroDataStorage-Swift.h"
#else
#import <NitroDataStorage/NitroDataStorage-Swift.h>
#endif

namespace margelo::nitro::datastorage {

// Helper function to convert AnyValue to NSObject
static id anyValueToNSObject(const AnyValue& value) {
  if (std::holds_alternative<std::monostate>(value)) {
    return [NSNull null];
  } else if (std::holds_alternative<bool>(value)) {
    return @(std::get<bool>(value));
  } else if (std::holds_alternative<double>(value)) {
    return @(std::get<double>(value));
  } else if (std::holds_alternative<int64_t>(value)) {
    return @(std::get<int64_t>(value));
  } else if (std::holds_alternative<std::string>(value)) {
    return [NSString stringWithUTF8String:std::get<std::string>(value).c_str()];
  } else if (std::holds_alternative<AnyArray>(value)) {
    const auto& array = std::get<AnyArray>(value);
    NSMutableArray* nsArray = [NSMutableArray arrayWithCapacity:array.size()];
    for (const auto& item : array) {
      [nsArray addObject:anyValueToNSObject(item)];
    }
    return nsArray;
  } else if (std::holds_alternative<AnyObject>(value)) {
    const auto& obj = std::get<AnyObject>(value);
    NSMutableDictionary* nsDict = [NSMutableDictionary dictionaryWithCapacity:obj.size()];
    for (const auto& [key, val] : obj) {
      NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
      nsDict[nsKey] = anyValueToNSObject(val);
    }
    return nsDict;
  }
  return [NSNull null];
}

// Helper function to convert AnyMap to NSDictionary
static NSDictionary* anyMapToNSDictionary(std::shared_ptr<AnyMap> map) {
  const auto& cppMap = map->getMap();
  NSMutableDictionary* dict = [NSMutableDictionary dictionaryWithCapacity:cppMap.size()];
  for (const auto& [key, value] : cppMap) {
    NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
    dict[nsKey] = anyValueToNSObject(value);
  }
  return dict;
}

// Helper function to convert NSObject to AnyValue
static AnyValue nsObjectToAnyValue(id obj) {
  if (obj == nil || [obj isKindOfClass:[NSNull class]]) {
    return AnyValue{std::monostate{}};
  } else if ([obj isKindOfClass:[NSNumber class]]) {
    NSNumber* num = (NSNumber*)obj;
    const char* type = [num objCType];
    if (strcmp(type, @encode(BOOL)) == 0 || strcmp(type, @encode(char)) == 0) {
      return AnyValue{[num boolValue]};
    } else {
      return AnyValue{[num doubleValue]};
    }
  } else if ([obj isKindOfClass:[NSString class]]) {
    return AnyValue{std::string([(NSString*)obj UTF8String])};
  } else if ([obj isKindOfClass:[NSArray class]]) {
    NSArray* nsArray = (NSArray*)obj;
    AnyArray array;
    array.reserve([nsArray count]);
    for (id item in nsArray) {
      array.push_back(nsObjectToAnyValue(item));
    }
    return AnyValue{array};
  } else if ([obj isKindOfClass:[NSDictionary class]]) {
    NSDictionary* nsDict = (NSDictionary*)obj;
    AnyObject object;
    for (NSString* key in nsDict) {
      object[std::string([key UTF8String])] = nsObjectToAnyValue(nsDict[key]);
    }
    return AnyValue{object};
  }
  return AnyValue{std::monostate{}};
}

// Helper function to convert NSDictionary to AnyMap
static std::shared_ptr<AnyMap> nsDictionaryToAnyMap(NSDictionary* dict) {
  std::shared_ptr<AnyMap> map = AnyMap::make();
  for (NSString* key in dict) {
    std::string cppKey = std::string([key UTF8String]);
    map->setAny(cppKey, nsObjectToAnyValue(dict[key]));
  }
  return map;
}

class HybridNitroDataStorageImpl: public HybridNitroDataStorageSpec {
private:
  HybridNitroDataStorage* _swiftImpl;
  
public:
  explicit HybridNitroDataStorageImpl(): HybridObject(TAG) {
    _swiftImpl = [[HybridNitroDataStorage alloc] init];
  }
  
  static constexpr auto TAG = "NitroDataStorage";
  
  void loadHybridMethods() override {
    registerHybrids(this, [](Prototype& prototype) {
      prototype.registerHybridMethod("setItem", &HybridNitroDataStorageImpl::setItem);
      prototype.registerHybridMethod("getItem", &HybridNitroDataStorageImpl::getItem);
      prototype.registerHybridMethod("removeItem", &HybridNitroDataStorageImpl::removeItem);
      prototype.registerHybridMethod("getAllKeys", &HybridNitroDataStorageImpl::getAllKeys);
      prototype.registerHybridMethod("clear", &HybridNitroDataStorageImpl::clear);
      prototype.registerHybridMethod("contains", &HybridNitroDataStorageImpl::contains);
      prototype.registerHybridGetter("count", &HybridNitroDataStorageImpl::getCount);
      // Note: memorySize is already provided by HybridObject base class via getExternalMemorySize()
    });
  }
  
  void setItem(const std::string& key, std::shared_ptr<AnyMap> value) override {
    @autoreleasepool {
      NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
      
      // Convert AnyMap directly to NSDictionary - no JSON serialization!
      NSDictionary* dict = anyMapToNSDictionary(value);
      
      NSError* error = nil;
      [_swiftImpl setItemWithKey:nsKey value:dict error:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
    }
  }
  
  std::optional<std::shared_ptr<AnyMap>> getItem(const std::string& key) override {
    @autoreleasepool {
      NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
      
      NSError* error = nil;
      NSDictionary* result = [_swiftImpl getItemWithKey:nsKey error:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
      
      if (result == nil) {
        return std::nullopt;
      }
      
      // Convert NSDictionary directly to AnyMap - no JSON serialization!
      return nsDictionaryToAnyMap(result);
    }
  }
  
  bool removeItem(const std::string& key) override {
    @autoreleasepool {
      NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
      
      NSError* error = nil;
      NSNumber* result = [_swiftImpl removeItemWithKey:nsKey error:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
      
      return [result boolValue];
    }
  }
  
  std::vector<std::string> getAllKeys() override {
    @autoreleasepool {
      NSError* error = nil;
      NSArray<NSString*>* keys = [_swiftImpl getAllKeysWithError:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
      
      std::vector<std::string> result;
      if (keys != nil) {
        for (NSString* key in keys) {
          result.push_back([key UTF8String]);
        }
      }
      return result;
    }
  }
  
  void clear() override {
    @autoreleasepool {
      NSError* error = nil;
      [_swiftImpl clearWithError:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
    }
  }
  
  bool contains(const std::string& key) override {
    @autoreleasepool {
      NSString* nsKey = [NSString stringWithUTF8String:key.c_str()];
      
      NSError* error = nil;
      NSNumber* result = [_swiftImpl containsWithKey:nsKey error:&error];
      
      if (error != nil) {
        throw std::runtime_error([[error localizedDescription] UTF8String]);
      }
      
      return [result boolValue];
    }
  }
  
  double getCount() override {
    @autoreleasepool {
      return [_swiftImpl count];
    }
  }
  
  size_t getExternalMemorySize() noexcept override {
    @autoreleasepool {
      return static_cast<size_t>([_swiftImpl memorySize]);
    }
  }
};

} // namespace margelo::nitro::datastorage
