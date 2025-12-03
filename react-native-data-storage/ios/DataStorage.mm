#import "MyTurboModule.h"
#import <ReactCodegen/MyTurboModule/MyTurboModule.h>

@implementation MyTurboModule

RCT_EXPORT_MODULE(MyTurboModuleObjC)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeMyTurboModuleSpecJSI>(params);
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

- (NSNumber *)addNumbers:(double)a b:(double)b { 
  return @(a + b);
}


@end
