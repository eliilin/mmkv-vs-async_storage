
#import <React/RCTBridgeModule.h>
#import <ReactCommon/RCTTurboModule.h>

@protocol NativeDataStorageSpec <RCTBridgeModule, RCTTurboModule>

- (NSNumber *)addNumbers:(double)a b:(double)b;

@end

NS_ASSUME_NONNULL_BEGIN

@interface DataStorage : NSObject <NativeDataStorageSpec>

@end

NS_ASSUME_NONNULL_END
