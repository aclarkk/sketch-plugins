//
//  NSView+AutoLayout.h
//  Panels
//
//  Created by Tomas Hanacek on 07/12/15.
//  Copyright © 2015 Tomas Hanacek. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface NSView (AutoLayout)

- (void)alignVisual:(NSString *)format views:(NSDictionary *)views;
- (void)centerHorizontally:(NSView *)view;
- (void)centerHorizontally:(NSView *)view with:(NSView *)secondView;
- (void)centerVertically:(NSView *)view;
- (void)centerVertically:(NSView *)view with:(NSView *)secondView;
- (void)equalWidth:(NSView *)view;
- (void)equalHeight:(NSView *)view;

@end
