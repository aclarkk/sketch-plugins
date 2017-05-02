//
//  ICSketchApi.h
//  Panels
//
//  Created by Tomáš Hanáček on 4/7/16.
//  Copyright © 2016 Tomas Hanacek. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "ICPanelsManager.h"

@interface ICSketchApi : NSObject

- (id)initWithBundle:(NSBundle *)bundle panelsManager:(ICPanelsManager *)panelsManager;
- (NSString *)getDocumentId;
- (NSArray *)selectedLayers:(id)document;

// process images
- (void)processImages:(NSArray *)images selection:(NSArray *)selection identifier:(NSString *)identifier layerBlock:(void (^)(id layer, NSImage *image))layerBlock;
- (void)processImages:(NSArray *)images selection:(NSArray *)selection identifier:(NSString *)identifier startIndex:(NSUInteger)startIndex layerBlock:(void (^)(id layer, NSImage *image))layerBlock;
- (void)processImages:(NSArray *)images selection:(NSArray *)selection identifier:(NSString *)identifier commandIdentifier:(NSString *)commandIdentifier layerBlock:(void (^)(id layer, NSImage *image))layerBlock;
- (void)processImages:(NSArray *)images selection:(NSArray *)selection identifier:(NSString *)identifier commandIdentifier:(NSString *)commandIdentifier startIndex:(NSUInteger)startIndex layerBlock:(void (^)(id layer, NSImage *image))layerBlock;

// placeholder
- (void)setPlaceholderImageToLayers:(NSArray *)layers;
- (void)setPlaceholderImageToLayers:(NSArray *)layers ancestorIDs:(NSArray *)ancestorIDs;

// fill
- (void)setFillForLayers:(NSArray *)layers image:(NSImage *)imageNS;
- (void)setFillOverrideForLayers:(NSArray *)layers image:(NSImage *)imageNS ancestorIDs:(NSArray *)ancestorIDs;

- (void)setFill:(id)layer image:(id)imageObj;
- (void)setFill:(id)layer image:(id)imageObj patternFillType:(NSInteger)patternFillType;
- (void)setFillOverride:(id)layer image:(NSImage *)imageNS ancestorIDs:(NSArray *)ancestorIDs;

// watch
- (void)watchPath:(NSString *)path callbackID:(NSString *)callbackID;
- (void)unwatchPath:(NSString *)path callbackID:(NSString *)callbackID;

// properties
- (ICPanelsManager *)panelsManager;

@end
