//
//  Panel.h
//  Panels
//
//  Created by Tomas Hanacek on 06/12/15.
//  Copyright © 2015 Tomas Hanacek. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@class ICPanel;

@protocol ICPanelDelegate <NSObject>

- (void)commandFromMenu:(id)command forIdentifier:(NSString *)identifier;

@end

@interface ICPanel : NSObject

@property (readonly, copy, nonatomic) NSString *identifier;
@property (readonly, copy, nonatomic) NSString *name;
@property (readonly, copy, nonatomic) NSString *version;
@property (readonly, copy, nonatomic) NSString *changelog;
@property (readonly, copy, nonatomic) NSURL *homepageURL;
@property (readonly, copy, nonatomic) NSDictionary *commands;
@property (readonly, copy, nonatomic) NSMenuItem *menuItem;
@property (readonly, copy, nonatomic) NSURL *panelURL;
@property (readonly, copy, nonatomic) NSURL *indexURL;
@property (readonly, copy, nonatomic) NSImage *iconImage;
@property (readonly, copy, nonatomic) NSImage *activeIconImage;
@property (readonly, copy, nonatomic) NSArray *actions;
@property (readonly, copy, nonatomic) NSString *apiContents;
@property (readonly, copy, nonatomic) id metadataCommand;
@property (nonatomic, weak) id<ICPanelDelegate> delegate;
@property (nonatomic) BOOL hasSettings;
@property (nonatomic) BOOL showChangelog;
@property (nonatomic) BOOL debug;
@property (nonatomic) BOOL autoOpen;
@property (nonatomic) BOOL disableCocoaScriptPreprocessor;
@property (nonatomic) BOOL disableHeader;
@property (nonatomic) BOOL onboarding;
@property (nonatomic) CGSize onboardingSize;
@property (readonly, copy, nonatomic) NSURL *onboardingURL;
@property (readonly, copy, nonatomic) NSString *onboardingVideoUrl;
@property (nonatomic) NSUInteger order;
@property (nonatomic) id runOnSelectionCommand;
@property (nonatomic) id runOnLayerResizeFinishedCommand;
@property (nonatomic) CGFloat width;
@property (nonatomic) CGFloat height;
@property (nonatomic) Class controllerClass;

- (id)initWithJSON:(NSDictionary *)data panelURL:(NSURL *)panelURL settingsPath:(NSString *)settingsPath;
- (void)setSettingsValue:(id)value forKey:(NSString *)key;
- (id)settingsValueForKey:(NSString *)key;
- (NSDictionary *)settings;
- (CGSize)size;
- (void)setSize:(CGSize)size;
- (CGSize)minSize;
- (NSString *)settingsDocumentsPath;
- (NSString *)title;

@end
