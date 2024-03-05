const express = require('express');
const fs = require('fs');
const path = require('path');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');





const app = express();
const port = process.env.PORT || 3000;

const jsonFilePath = path.join(__dirname, 'datasetB.json');
app.use(express.static(path.join(__dirname, 'public')));


const hbs = exphbs.create({
  extname: '.hbs',
  helpers: {
      ifEqual: function (a, b, opts) {
          if (a === b) {
              return opts.fn(this);
          } else {
              return opts.inverse(this);
          }
      },
      eq: function (a, b) {
          return a === b;
      },
      formatReviews: function(reviews) {
          if (reviews === 0) {
              return 'N/A';
          } else {
              return reviews;
          }
      }
  }
});


app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


// Middleware to asynchronously load JSON data
app.get('/data', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error loading JSON data:', err);
        res.status(500).send('Internal Server Error');
      } else {
        const jsonData = JSON.parse(data);
        console.log('JSON data is loaded and ready!'); // Log message indicating JSON data is loaded
        res.render('home', { title: 'Json data', body: jsonData }); // Render 'home' template with JSON data
      }
    });
  });

  app.get('/allData', (req, res) => {
    const jsonFilePathB = path.join(__dirname, 'datasetB.json');
  
    // Read the JSON file asynchronously
    fs.readFile(jsonFilePathB, 'utf8', (err, data) => {
      if (err) {
        console.error('Error loading JSON data:', err);
        res.status(500).send('Internal Server Error');
      } else {
        // Parse the JSON data
        const jsonData = JSON.parse(data);
        // Render the Handlebars template with the product data
        res.render('allData', { products: jsonData });
      }
    });
  });
 
  // Middleware to load JSON data when accessing /data route

  
// Route to display product details by index
app.get('/data/product/:index', (req, res) => {
  const jsonData = res.locals.jsonData;
  const index = parseInt(req.params.index);

  if (index >= 0 && index < jsonData.length) {
    const asin = jsonData[index].asin;
    res.json({ asin: asin });
  } else {
    res.status(404).json({ error: 'Product not found. Invalid index.' });
  }
 
});

// Route to display form for searching product by ID and handle product search
app.get('/data/search/prdID', (req, res) => {
  const searchForm = `
    <form action="/data/search/prdID" method="get">
      <label for="productID">Enter Product ID:</label><br>
      <input type="text" id="productID" name="productID"><br>
      <button type="submit">Search</button>
    </form>
  `;
  res.render('home', { title: 'Search by Product ID', body: searchForm });
});

app.get('/data/search/prdID', (req, res) => {
  const productID = req.query.productID;
  const jsonData = res.locals.jsonData;

  const product = jsonData.find(product => product.product_id === productID);

  if (product) {
    const productDetails = `
      <h2>Product Details</h2>
      <p>Product ID: ${product.product_id}</p>
      <p>Title: ${product.title}</p>
      <p>Category: ${product.category}</p>
      <!-- Add more details as needed -->
    `;
    res.render('home', { title: 'Product Details', body: productDetails });
  } else {
    res.status(404).send('Product not found');
  }
});

// Route to display form for searching product by Name and handle product search
app.get('/data/search/prdName', (req, res) => {
  const searchForm = `
    <form action="/data/search/prdName" method="get">
      <label for="productName">Enter Product Name:</label><br>
      <input type="text" id="productName" name="productName"><br>
      <button type="submit">Search</button>
    </form>
  `;
  res.render('home', { title: 'Search by Product Name', body: searchForm });
});

app.get('/data/search/prdName', (req, res) => {
  const productName = req.query.productName;
  const jsonData = res.locals.jsonData;

  const relatedProducts = jsonData.filter(product =>
    product.title.toLowerCase().includes(productName.toLowerCase())
  );

  if (relatedProducts.length > 0) {
    const output = relatedProducts.map(product => `
      <div>
        <p>Product ID: ${product.product_id}</p>
        <p>Title: ${product.title}</p>
        <p>Category: ${product.category}</p>
        <!-- Add more details as needed -->
      </div>
    `).join('');

    res.send(output);
  } else {
    res.status(404).send('No products found with the given name');
  }
});

// Root route to display a greeting with header and footer
app.get('/', (req, res) => {
  res.render('home', { title: 'Welcome', body: 'astha , N01580273' });
});

// Middleware to handle 404 errors
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
