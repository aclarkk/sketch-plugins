# Sync Sketch Plugins across multiple computers
Use git instead of dropbox because downloading & extracting .zip files is dumb.

Set up is simple:
```
  # go to plugin folder
  cd ~/Library/Application\ Support/com.bohemiancoding.sketch3/

  # move plugin folder to an easier to access spiot
  mv Plugins/ ~/path/to/new-folder

  # create a symlink so sketch can find the new folder
  ln -s ~/path/to/new-folder Plugins

```

Adding Plugins is simple
```
  # just clone the plugin to the new folder
  git clone git@github.com:new-sketch-plugin.git ~/path/to/new-folder

```

Syncing is simple
```
 #commit, push
 git commit -am 'added new plugin'
 git push

 # on a different computer
 git pull

```

That's really it, I think.
