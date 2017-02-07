//
//  ICLogger.h
//  Panels
//
//  Created by Tomáš Hanáček on 7/11/16.
//  Copyright © 2016 Tomas Hanacek. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef enum {
    kICRavenLogLevelDebug,
    kICRavenLogLevelDebugInfo,
    kICRavenLogLevelDebugWarning,
    kICRavenLogLevelDebugError,
    kICRavenLogLevelDebugFatal
} ICRavenLogLevel;

@interface ICLogger : NSObject

+ (void)log:(NSString *)message dns:(NSString *)dns;

+ (void)error:(NSError *)error dns:(NSString *)dns;
+ (void)error:(NSError *)error additionalExtra:(NSDictionary *)additionalExtra dns:(NSString *)dns;
+ (void)error:(NSError *)error additionalExtra:(NSDictionary *)additionalExtra additionalTags:(NSDictionary *)additionalTags dns:(NSString *)dns;

+ (void)captureMessage:(NSString *)message
                 level:(ICRavenLogLevel)level
       additionalExtra:(NSDictionary *)additionalExtra
        additionalTags:(NSDictionary *)additionalTags
                   dns:(NSString *)dns;

@end
