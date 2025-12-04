
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

@protocol NativeDataStorageSpec <RCTBridgeModule, RCTTurboModule>

- (void)getItem:(NSString *)key
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject;

- (void)setItem:(NSString *)key
          value:(NSDictionary *)value
        resolve:(RCTPromiseResolveBlock)resolve
         reject:(RCTPromiseRejectBlock)reject;

- (void)removeItem:(NSString *)key
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

- (void)getAllKeys:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;

- (void)clear:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject;

@end

NS_ASSUME_NONNULL_BEGIN

@interface DataStorage : NSObject <NativeDataStorageSpec>

@end

NS_ASSUME_NONNULL_END
