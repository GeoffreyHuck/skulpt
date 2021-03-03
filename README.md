# Modified version of Skulpt for FranceIOI

The file *src/internalpython.js* should be created automatically when building the sources. If that's not the case, you should create it with the following content :

    Sk.internalPy={"files":{"src/classmethod.py":"class classmethod(object):\n    \"Emulate PyClassMethod_Type() in Objects/funcobject.c\"\n\n    def __init__(self, f):\n        self.f = f\n\n    def __get__(self, obj, klass=None):\n        if klass is None:\n            klass = type(obj)\n        def newfunc(*args):\n            return self.f(klass, *args)\n        return newfunc\n","src/property.py":"class property(object):\n    \"Emulate PyProperty_Type() in Objects/descrobject.c\"\n\n    def __init__(self, fget=None, fset=None, fdel=None, doc=None):\n        self.fget = fget\n        self.fset = fset\n        self.fdel = fdel\n        if doc is None and fget is not None:\n            if hasattr(fget, '__doc__'):\n                doc = fget.__doc__\n            else:\n                doc = None\n        self.__doc__ = doc\n\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self\n        if self.fget is None:\n            raise AttributeError(\"unreadable attribute\")\n        return self.fget(obj)\n\n    def __set__(self, obj, value):\n        if self.fset is None:\n            raise AttributeError(\"can't set attribute\")\n        self.fset(obj, value)\n\n    def __delete__(self, obj):\n        if self.fdel is None:\n            raise AttributeError(\"can't delete attribute\")\n        self.fdel(obj)\n\n    def getter(self, fget):\n        return type(self)(fget, self.fset, self.fdel, self.__doc__)\n\n    def setter(self, fset):\n        return type(self)(self.fget, fset, self.fdel, self.__doc__)\n\n    def deleter(self, fdel):\n        return type(self)(self.fget, self.fset, fdel, self.__doc__)\n","src/staticmethod.py":"class staticmethod(object):\n    \"Emulate PyStaticMethod_Type() in Objects/funcobject.c\"\n\n    def __init__(self, f):\n        self.f = f\n\n    def __get__(self, obj, objtype=None):\n        return self.f\n"}}

In this modified version, each modification of a variable 

    v = X

is transformed to

    v = window.currentPythonRunner.reportValue(X, 'v');

Objects, lists and dicts contains a unique *__uuid* field. Every time an object method is called, a list is modified, a dict is modified, a new reference is created with the same *__uuid*. These objects also contain a *_parents* which contains the _uuid of the parents. This allows to create a new reference for the parent objects. For example :

    a = [1, 2, 3]
    b = [..., a, ...]  # A list containing a
    c = { ..., 'element': a , ... }  # A dict containing a

*a._parents* will contain the _uuid of *b* and *c*. This allows to create a new reference for *b* and *c* whenever *a* changes.

Note : An object has an internal variable *$d* (dollar sign + d) that is a dict and that contains all the object's variable memebers.

The code related to the references update is in *src/persistent.js*. 

Most of the modifications are in *src/compile.js* and their aim is to call the rights functions of *src/persistent.js* within the javascript code generated from the python one.

The generated javascript code is visible in Codecast's console when you hit "Compile". It is also possible to add a "debugger;" instruction within the generated code if you add

    out("debugger;");

at the place you want in *src/compile.js*/


# Development

    npm run watch

It updates dist/skulpt.js every time there is a modification in the source.


# Build

    npm run dist

You can then get the file *dist/skulpt.min.js* and replace Codecast's skulpt file.


# Welcome to Skulpt

[![Join the chat at https://gitter.im/skulpt/skulpt](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/skulpt/skulpt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Skulpt is a Javascript implementation of Python 2.x. Python that runs in your browser! Python that runs on your iPad! Its being used several projects including, [Interactive Python Textbooks](http://interactivepython.org) -- You can see skulpt in action there.  Try out [some turtle graphics examples](http://interactivepython.org/runestone/static/thinkcspy/PythonTurtle/InstancesAHerdofTurtles.html) to see Skulpt in action.

[![Build Status](https://travis-ci.org/skulpt/skulpt.png)](https://travis-ci.org/skulpt/skulpt)

## Origins

Skulpt is the brainchild of Scott Graham. See [Skulpt.org](http://skulpt.org) for some early demos of skulpt in action.

Brad Miller has been project maintainer since sometime in 2010/2011 along with core contributors Albert-Jan Nijburg, Scott Rixner,  Meredydd Luff and others.

## Current Priorities

* We have updated our development toolchain to include nodejs and webpack.  If you have been a developer in the past make sure you check out the documentation for the current procedures on building skulpt.
* Work on Python3 - With python 2 coming to the end of its life at the end of this year, being more and more Python3 compliant is a high priority.  Of course how Python3 you need to be depends on the situation.  For many uses, Skulpt is already there.  But for more advanced work we are not. You can keep up with this work by configuring skulpt to run in Python3 mode.

```
Sk.configure({
    .... other settings
    __future__: Sk.python3
});
```

## How can I help?

Welcome to the Skulpt developer community! We welcome new developers of all levels and abilities. Check out the ideas list below. And then some practical things for getting started after that.

### Ideas List

1. Python 3 -- see above.

1. Expand the skulpt standard library to include more modules from the CPython standard library.  So far we have math, random, turtle, time (partial) random (partial) urllib (partial) unittest, image, DOM (partial) and re (partial).  Any of the partial modules could be completed, or many other CPython modules could be added.  Potential new modules from the standard library include:  functools, itertools, collections, datetime, operator, and string.  Many of these would be relatively easy projects for a less experienced student to take on.

2. Over time we have had numerous requests for more advanced Python modules to be included in Skulpt.  These include, portions of matplotlib, tkinter, and numpy.  These are much more challenging because they contain C code in their implementation, but if a reasonable subset could be implemented in Javascript this would make it much easier to directly add many more python modules that rely on these three.  In addition, it would allow for skulpt to potentially be used in teaching an even broader set of topics.

3. Expand and clean up the foreign function API.  This API is critical for implementing parts of the standard library.

4. Do a better job of supporting Python3 semantics, but make Python2/Python3 behavior configurable with a single flag. Sk.python3 is already there for this purpose.  Another positive step in this direction would be to update our grammar to Python2.7.  Updating the grammar would allow us to add set literals, dictionary comprehensions, and other features present in 2.7.x and Python 3.3.x.  This would be an excellent project for a student interested in language design, parsing, and the use of abstract syntax trees.

6. Make fully workable, and expand support for DOM access as part of the standard library.

7. Expand and improve overall language coverage.   Currently Skulpt does an excellent job of meeting the 80/20 rule.  We cover the vast majority of the language features used by the 80% (maybe even 90%) of the code.  But there are builtins that are not implemented at all, and there are builtins with only partial implementations.  

8. Implement the hooks for a debugger. This may be a half step towards 1 or may be in a completely different direction, but allowing students to debug line by line a program they have written would have some real benefit.

### Building Skulpt

Building Skulpt is straightforward:

1. Clone the repository from GitHub, ideally using your own fork if you're planning on making any contributions
2. Install node.js
3. Install the required dependencies using `npm install`
4. Navigate to the repository and run `npm run dist`
5. The tests should run and you will find `skulpt.min.js` and `skulpt-stdlib.js` in the `dist`folder


### Contributing

There is plenty of work still to do in making improvements to Skulpt.  If you would like to contribute

1. Create a Github account if you don't already have one
2. Create a Fork of the Skulpt repository -- This will make a clone of the repository in your account.  **DO NOT** clone this one.  Once you've made the fork you will clone the forked version in your account to your local machine for development.
3. Read the HACKING.md file to get the "lay of the land".  If you plan to work on creating  a module then you may also find this [blog post](http://reputablejournal.com/adding-a-module-to-skulpt.html) helpful.
3. Check the issues list for something to do.
4. Follow the instructions above to get skulpt building
5. Fix or add your own features.  Commit and push to your forked version of the repository.  When everything is tested and ready to be incorporated into the master version...
6. Make a Pull Request to get your feature(s) added to the main repository.


## Community

Check out the mailing list:  https://groups.google.com/forum/?fromgroups#!forum/skulpt

## Acknowledgements

As time goes on its getting more dangerous to try to acknowledge everyone who has contributed to the project.  And, after all, this is git, so their names are all in the historical record.  But there are a few to call out.

* First and foremost to Scott Graham for starting the original project.
* Bob Lacatena for lots of work on Python longs
* Charles Severence for bug fixes and the re module.
* Leszek Swirski and Meredydd Luff for Suspensions
* Albert-Jan Nijburg for countless bug fixes and process improvements
* Ben Wheeler for the new and improved turtle module
* Scott Rixner and students for many bug fixes and improvements
* Of course, The complete list is here:  https://github.com/skulpt/skulpt/graphs/contributors
