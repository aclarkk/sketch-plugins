//
//  PanelView.h
//  Panels
//
//  Created by Tomas Hanacek on 06/12/15.
//  Copyright © 2015 Tomas Hanacek. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "ICPanel.h"
#import "ICPanelViewControllerProtocol.h"

@class ICPanelView;

@protocol ICPanelViewDelegate <NSObject>

- (void)close:(ICPanelView *)panelView;

@end

@interface ICPanelView : NSView

@property (nonatomic, weak) id<ICPanelViewDelegate> delegate;
@property (nonatomic, getter=isFullscreen) BOOL fullscreen;
- (id)initWithFrame:(NSRect)frameRect panel:(ICPanel *)panel contentViewController:(NSViewController<ICPanelViewControllerProtocol> *)contentViewController;
- (NSViewController<ICPanelViewControllerProtocol> *)contentViewController;
- (void)setHidden:(BOOL)hidden forActionButton:(NSString *)identifier;
- (void)resetContentView;

@end
