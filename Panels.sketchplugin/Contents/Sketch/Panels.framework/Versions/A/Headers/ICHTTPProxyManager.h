//
//  ICHTTPProxyManager.h
//  Panels
//
//  Created by Adam Zdara on 01/03/2017.
//  Copyright © 2017 Tomas Hanacek. All rights reserved.
//

#import <Foundation/Foundation.h>

@class ICHTTPProxyProtocol;

@interface ICHTTPProxyManager : NSObject<NSURLSessionDelegate, NSURLSessionDataDelegate>

@property (nonatomic) NSURLSession * session;

- (void)bootstrap;
+ (void)setupHTTPProxyForConfiguration:(NSURLSessionConfiguration *)configuration;
+ (ICHTTPProxyManager *)shaderManager;
- (void)registerTask:(NSURLSessionTask *)task forProtocol:(ICHTTPProxyProtocol *)protocol;

@end
