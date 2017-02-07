//
//  PanelViewControllerDelegate.h
//  Panels
//
//  Created by Tomas Hanacek on 07/01/16.
//  Copyright © 2016 Tomas Hanacek. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol ICPanelViewControllerProtocol <NSObject>

@required
@property (nonatomic, weak) id delegate;
- (id)initWithPanel:(ICPanel *)panel;
- (void)callback:(NSString *)data;
- (void)callAction:(NSString *)identifier;
- (void)callAction:(NSString *)identifier data:(NSString *)data;
- (void)setCommandIdentifier:(NSString *)identifier;

@end
