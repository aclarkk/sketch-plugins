//
//  ICTabBar.h
//  Panels
//
//  Created by Tomáš Hanáček on 5/24/16.
//  Copyright © 2016 InVision LABS. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "ICTabBarItem.h"

@protocol ICTabBarDelegate <NSObject>

@required
- (void)tabSelected:(ICTabBarItem *)tabBarItem;

@end


@interface ICTabBar : NSView

@property (nonatomic, weak) id<ICTabBarDelegate> delegate;
- (id)initWithTabs:(NSArray<ICTabBarItem *> *)tabs;

@end
