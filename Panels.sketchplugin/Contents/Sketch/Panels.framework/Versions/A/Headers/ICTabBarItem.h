//
//  ICTabBarItem.h
//  Panels
//
//  Created by Tomáš Hanáček on 5/24/16.
//  Copyright © 2016 InVision LABS. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface ICTabBarItem : NSObject

@property (nonatomic, retain) NSString *title;
@property (nonatomic, retain) NSString *identifier;
@property (nonatomic, retain) NSViewController *viewController;
- (id)initWithTitle:(NSString *)title identifier:(NSString *)identifier viewController:(NSViewController *)viewController;
+ (id)itemWithTitle:(NSString *)title identifier:(NSString *)identifier viewController:(NSViewController *)viewController;

@end
