# Resume Magic

A dynamic resume service that generates beautiful, customizable resumes from GitHub-hosted JSON data. Create professional resumes with multiple formats, themes, and language support.

## 🌟 Features

### Resume Formats
- **MIT Format**: Clean, academic-style layout focusing on content
- **Modern Format**: Timeline-based layout with visual elements and cards
- Switch between formats using URL parameters

### Customization
- **Dynamic Theme Switching**: 25+ Bootswatch themes available
  - Cerulean, Cosmo, Cyborg, Darkly, Flatly, and more
  - Change themes on-the-fly without reloading
- **Multi-language Support**
  - Host multiple language versions of your resume
  - Easy language switching through navigation
  - Supports any language variants (en, es, fr, etc.)

### Export Options
- **PDF Download**
  - High-quality PDF generation
  - Maintains selected theme and format
  - Perfect for sharing and printing
- **HTML Download**
  - Standalone HTML file with embedded styles
  - Includes all assets and formatting
  - Great for web hosting

### Technical Features
- **Responsive Design**: Works on all devices and screen sizes
- **GitHub Integration**: Pull resume data from your repository
- **Docker Support**: Easy deployment with Docker
- **Environment Configuration**: Flexible setup options

## 🚀 Getting Started

### Prerequisites

- Node.js 24+ or Docker
- GitHub repository with resume data
- Browserless API key for PDF generation

### Repository Structure

Your GitHub repository should contain:

```
your-resume-repo/
├── index.json           # Configuration and settings
├── resume.en.json      # English resume data
├── resume.es.json      # Spanish resume data
└── resume.[lang].json  # Other language variants
```

#### index.json Example
```json
{
    "version": "1.0.0",
    "variants": {
        "en": "resume.en.json",
        "es": "resume.es.json"
    },
    "settings": {
        "default_variant": "en",
        "theme": "flatly",
        "allow_pdf_download": true,
        "allow_html_download": true
    }
}
```

### Installation

#### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/resume-magic.git
cd resume-magic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev
```

#### Docker Installation
```bash
# Build and start with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Create a `.env` file with:

```env
# Required for PDF generation
BROWSERLESS_API_KEY=your_api_key
BROWSERLESS_URL=https://browserless.example.com

# Base URL for the application
BASE_URL=http://localhost:3000
```

## 📖 Usage

### Accessing Your Resume

1. Create your resume repository on GitHub
2. Access your resume at:
   ```
   http://localhost:3000/username/repo
   ```

### URL Parameters

- **Format Selection**:
  ```
  /username/repo/modern  # Modern timeline format
  /username/repo        # Default MIT format
  ```

- **Language Selection**:
  ```
  /username/repo?lang=es  # Spanish version
  /username/repo?lang=en  # English version
  ```

- **Theme Selection**:
  ```
  /username/repo?theme=cyborg   # Dark theme
  /username/repo?theme=flatly   # Light theme
  ```

- **Combined Parameters**:
  ```
  /username/repo/modern?lang=es&theme=cyborg
  ```

### Download Options

- **PDF Download**: Click the PDF button in navigation
  - Maintains current theme and format
  - Perfect for printing and sharing

- **HTML Download**: Click the HTML button in navigation
  - Includes all styles and formatting
  - Self-contained file

## 🛠️ Development

### Project Structure
```
.
├── app.js              # Main application file
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose setup
├── views/             # Pug templates
│   ├── layout.pug     # Base layout template
│   ├── resume/        # Resume templates
│   │   ├── mit.pug    # MIT format template
│   │   └── modern.pug # Modern format template
│   ├── index.pug      # Homepage template
│   └── error.pug      # Error page template
├── public/            # Static assets
│   ├── css/          # Stylesheets
│   └── images/       # Images
└── example/          # Example resume files
```

### Key Components

- **Express.js Server**: Handles routing and template rendering
- **Pug Templates**: Dynamic HTML generation
- **Browserless Integration**: PDF generation service
- **Docker Support**: Containerization and deployment
- **Environment Configuration**: Flexible setup options

### Adding New Features

1. **New Format**:
   - Create template in `views/resume/`
   - Add format handling in `app.js`
   - Update documentation

2. **New Theme**:
   - Themes are provided by Bootswatch
   - Add theme to dropdown in `views/layout.pug`

3. **New Language**:
   - Add `resume.[lang].json` to your repository
   - Update `index.json` variants

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootswatch](https://bootswatch.com/) for the amazing themes
- [Browserless](https://browserless.io/) for PDF generation
- [Express.js](https://expressjs.com/) for the web framework
- [Pug](https://pugjs.org/) for templating

## 📞 Support

- Create an issue for bug reports
- Star the repository if you find it useful
- Fork and contribute to help improve the project
