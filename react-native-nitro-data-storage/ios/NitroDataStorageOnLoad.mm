//
//  NitroDataStorageOnLoad.mm
//  NitroDataStorage
//

#import <Foundation/Foundation.h>
#import <NitroModules/HybridObjectRegistry.hpp>
#import "HybridNitroDataStorageImpl.mm"

@interface NitroDataStorageOnLoad: NSObject
@end

@implementation NitroDataStorageOnLoad

+ (void)load {
  using namespace margelo::nitro::datastorage;
  
  margelo::nitro::HybridObjectRegistry::registerHybridObjectConstructor(
    "NitroDataStorage",
    []() -> std::shared_ptr<margelo::nitro::HybridObject> {
      return std::make_shared<HybridNitroDataStorageImpl>();
    }
  );
}

@end
