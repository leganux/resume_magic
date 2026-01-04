require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/bootswatch', express.static(path.join(__dirname, 'node_modules/bootswatch/dist')));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Resume Magic' });
});

// Get Your Own page
app.get('/get-your-own', (req, res) => {
    res.render('get-your-own', { title: 'Get Your Own Resume' });
});

// Donations page
app.get('/donate', (req, res) => {
    res.render('donate', { title: 'Support Resume Magic' });
});

// Dynamic resume routes
app.get('/:username/:repo/:format?', async (req, res) => {
    try {
        const { username, repo, format = '' } = req.params;
        const { lang, theme } = req.query;
        const indexUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/index.json`;
        
        // Fetch index.json
        const indexResponse = await axios.get(indexUrl);
        const indexData = indexResponse.data;
        
        // Get variant based on query param or default
        const selectedVariant = lang && indexData.variants[lang] ? lang : indexData.settings?.default_variant || 'en';
        const variantFile = indexData.variants[selectedVariant];
        
        if (!variantFile) {
            throw new Error('No valid resume variant found');
        }
        
        // Fetch resume data
        const resumeUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${variantFile}`;
        const resumeResponse = await axios.get(resumeUrl);
        const resumeData = resumeResponse.data;
        
        // Use theme from query param or settings
        const selectedTheme = theme || indexData.settings?.theme || 'flatly';
        indexData.settings = {
            ...indexData.settings,
            theme: selectedTheme
        };
        
        // Determine template based on format
        const template = format === 'modern' ? 'modern' : 'mit';
        
        // Render resume
        res.render(`resume/${template}`, {
            title: `${resumeData.profile.full_name} - Resume`,
            resume: {
                ...resumeData,
                settings: indexData.settings,
                variants: indexData.variants
            },
            username,
            repo,
            format
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(404).render('error', {
            title: 'Resume Not Found',
            message: 'The requested resume could not be found. Please check the username and repository name.'
        });
    }
});

// Download routes
app.get('/:username/:repo/download/:type', async (req, res) => {
    try {
        const { username, repo, type } = req.params;
        
        if (type === 'pdf') {
            try {
                // Get base URL from environment
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

                // Get format, language, and theme from query params
                const { format, lang, theme } = req.query;
                
                // Default theme from query or settings
                const selectedTheme = theme || 'flatly';

                // Fetch resume data
                const indexUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/index.json`;
                const indexResponse = await axios.get(indexUrl);
                const indexData = indexResponse.data;
                
                // Use query language or default from settings
                const selectedVariant = lang && indexData.variants[lang] ? lang : indexData.settings?.default_variant || 'en';
                const variantFile = indexData.variants[selectedVariant];
                
                if (!variantFile) {
                    throw new Error('No valid resume variant found');
                }
                
                const resumeUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${variantFile}`;
                const resumeResponse = await axios.get(resumeUrl);
                const resumeData = resumeResponse.data;

                // Generate standalone HTML
                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${resumeData.profile.full_name} - Resume</title>
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${selectedTheme}/bootstrap.min.css">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                        <style>
                            ${fs.readFileSync(path.join(__dirname, 'public/css/style.css'), 'utf8')}
                        </style>
                    </head>
                    <body>
                        <div class="container mt-4">
                            ${await new Promise((resolve, reject) => {
                                app.render(`resume/${format === 'modern' ? 'modern' : 'mit'}`, {
                                    resume: {
                                        ...resumeData,
                                        settings: indexData.settings,
                                        variants: indexData.variants
                                    }
                                }, (err, html) => {
                                    if (err) reject(err);
                                    else resolve(html);
                                });
                            })}
                        </div>
                    </body>
                    </html>
                `;

                // Send HTML to browserless with base URL for resources
                const response = await axios.post(`${process.env.BROWSERLESS_URL}/pdf?token=${process.env.BROWSERLESS_API_KEY}`, {
                    html,
                    options: {
                        printBackground: true,
                        margin: {
                            top: '10px',
                            right: '10px',
                            bottom: '10px',
                            left: '10px'
                        },
                        format: 'legal',
                        displayHeaderFooter: false
                    },
                    gotoOptions: {
                        waitUntil: 'networkidle0'
                    },
                    
                }, {
                    responseType: 'arraybuffer'
                });

                // Send PDF
                res.contentType('application/pdf');
                res.send(response.data);
            } catch (error) {
                console.error('Error generating PDF with browserless:', error);
                throw new Error('PDF generation failed');
            }
        } else if (type === 'html') {
            // Get format, language, and theme from query params
            const { format, lang, theme } = req.query;
            
            // Default theme from query or settings
            const selectedTheme = theme || 'flatly';

            // Fetch resume data
            const indexUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/index.json`;
            const indexResponse = await axios.get(indexUrl);
            const indexData = indexResponse.data;
            
            // Use query language or default from settings
            const selectedVariant = lang && indexData.variants[lang] ? lang : indexData.settings?.default_variant || 'en';
            const variantFile = indexData.variants[selectedVariant];
            
            if (!variantFile) {
                throw new Error('No valid resume variant found');
            }
            
            const resumeUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/${variantFile}`;
            const resumeResponse = await axios.get(resumeUrl);
            const resumeData = resumeResponse.data;
            
            // Generate standalone HTML
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${resumeData.profile.full_name} - Resume</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/${selectedTheme}/bootstrap.min.css">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                    <style>
                        ${fs.readFileSync(path.join(__dirname, 'public/css/style.css'), 'utf8')}
                    </style>
                </head>
                <body>
                    <div class="container mt-4">
                        ${await new Promise((resolve, reject) => {
                            app.render(`resume/${format === 'modern' ? 'modern' : 'mit'}`, {
                                resume: {
                                    ...resumeData,
                                    settings: indexData.settings
                                }
                            }, (err, html) => {
                                if (err) reject(err);
                                else resolve(html);
                            });
                        })}
                    </div>
                </body>
                </html>
            `;
            
            // Send HTML
            res.header('Content-Disposition', `attachment; filename="${username}-resume.html"`);
            res.contentType('text/html');
            res.send(html);
        } else {
            throw new Error('Invalid download type');
        }
    } catch (error) {
        console.error('Error generating download:', error);
        res.status(500).render('error', {
            title: 'Download Error',
            message: `Could not generate ${req.params.type.toUpperCase()}. Please try again later.`
        });
    }
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 Not Found',
        message: 'The requested page could not be found.'
    });
});

const PORT = process.env.PORT || 1771;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
