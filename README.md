# Flyweight Handlebars

Flyweight handlebars is an util to make easier the compilation, updating and rendering of files. You set the basePath for the templates, and then you get the handlebars compiled just by using the path (e.g. 'dir/template.html').
This package updates the compiled file when the file is modified (it controls if the file was modified since it was compiled, so it works as a hot-reload).
It also prevents memory leaking by controlling the last time one template was used. If it wasn't used in the specified interval, it deletes the compilation from memory.
You can also access handlebars (by its method getHandlebars(), so you can also use handlebars features like registerHelpers).

For more information about handlebars, you can check the docs: [Handlebars docs](https://handlebarsjs.com/). 

## Installation
```
npm install flyweight-handlebars
```


## Usage
```javascript
const FlyWeightHandlebars = require('flyweight-handlebars');
const hb = new FlyWeightHandlebars();
hb.setMaxDuration(60); // A compiled file will be erased from memory if it wasn't used in the last 60 seconds.
hb.setControlInterval(10); // It will make the memory control every 10 seconds.
hb.setTemplatesPath('./templates'); // All the files in ./templates can be reached. 

// My template is actually the handlebars rendering function.
const myTemplate = hb.getTemplate('main/main.html'); // If you don't specify encoding, default is utf-8.
// You use variables like in handlebars.
const rendered = myTemplate({variable: 'someVariable'}); 

// Get filenames from compilations in memory.
console.log(hb.getTemplatesFiles()); // Outputs: ["main/main.html"].

// Gives access to Handlebars.
hb.getHandlebars().registerHelper('some-helper', () => 'personalized helper');

// Removes it from memory.
hb.remove('main/main.html');

//Removes all templates from memory.
hb.empty();

```


## All methods
Method | Description
------------ | -------------
setTemplatesPath | Sets the dir in which it will look for every template.
setMaxDuration | Sets how much time it will keep the compiled files in memory.
getMaxDuration | Gets how much time compiled files are kept in memory.
setControlInterval | Sets the interval between each memory control.
countTemplatesInMemory | Gets how many templates it has in memory.
getHandlebars | Gets the handlebars instance.
getTemplate | Compiles and returns the rendering function for the specified file.
getTemplatesFiles | Returns an array with all the filenames in memory.
remove | Removes a compiled file from memory by its name ("main/main.html").
empty | Removes all the compiled files from memory.


## License

MIT © [Matías Puig](https://www.github.com/matipuig)
