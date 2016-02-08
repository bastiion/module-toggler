# Module-Toggler

Use it to easily toggle sites, confs and mods of php, apache2 and other software packages, that make use of a
link based module-structure

## usage

```
Usage: node ./index.js

Options:
  -a         Full path to the "available" folder                    [required]
  -e         Full path to the "enabled" folder                      [required]
  --en-cmd   Command to enable module (instead of just symlinking)
  --dis-cmd  Command to disable module (instead of just unlinking)
  -c         Command to execute after something was altered       
  -p         Prefix added to the link name (p.e. ".conf")    

```

## examples

To use it for apache2 sites on a debian-based system

```
module-toggler -a /etc/apache2/sites-available/ -e /etc/apache2/sites-enabled/ -c "service apache2 reload" --en-cmd a2ensite --dis-cmd a2dissite

```

## tipp

for regular used modules make yourself an alias

```
alias toggleApacheSites 'module-toggler -a /etc/apache2/sites-available/ -e /etc/apache2/sites-enabled/ -c "service apache2 reload" --en-cmd a2ensite --dis-cmd a2dissite'
 
```

