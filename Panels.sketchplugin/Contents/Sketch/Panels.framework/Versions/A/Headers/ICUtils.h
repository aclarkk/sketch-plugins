//
//  Utils.h
//  Panels
//
//  Created by Tomáš Hanáček on 3/25/16.
//  Copyright © 2016 Tomas Hanacek. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ICUtils : NSObject

+ (BOOL)createDirectoryIfNotExist:(NSString *)path;
+ (NSString *)objectToJSONString:(id)object;
+ (id)readJSON:(NSURL *)jsonURL;

@end
