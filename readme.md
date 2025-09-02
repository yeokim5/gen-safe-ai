# Gen-SAFE: AI-Powered Tool for Automated FMECA & FTA Generation

An advanced engineering workflow automation tool that leverages AI to generate professional-grade Failure Mode, Effects, and Criticality Analysis (FMECA) and Fault Tree Analysis (FTA) documents.

## 🚀 Features

- **AI-Powered Analysis**: Uses OpenAI GPT-4 to generate comprehensive safety analysis
- **Dual Input Modes**: Supports both structured YAML/JSON and natural language descriptions
- **Professional Output**: Generates industry-standard FMECA tables and FTA diagrams
- **Interactive Visualizations**: Mermaid.js-powered fault tree diagrams with zoom controls
- **Export Capabilities**: Download analysis as Markdown files and diagrams
- **Safety Standards Compliance**: Incorporates ISO 26262, MIL-STD-882E, and other standards
- **Production Ready**: Docker containerization, rate limiting, and comprehensive error handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js API   │    │   OpenAI API    │
│   (HTML/CSS/JS) │◄──►│   (Express)     │◄──►│   (GPT-4)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │   Static Files  │
                       │   Serving       │
                       └─────────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **AI Integration**: OpenAI GPT-4 API
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: Mermaid.js for fault tree diagrams
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet.js, rate limiting, input validation
- **Validation**: Joi schema validation

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/gen-safe.git
cd gen-safe
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
PORT=3000
```

### 3. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t gen-safe .

# Run the container
docker run -d \
  --name gen-safe \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your_api_key_here \
  gen-safe
```

## 📖 Usage

### Input Formats

**Structured Format (YAML-like):**
```yaml
systemName: Forward-Facing Lidar Unit
description: Scans environment to detect obstacles for autonomous ground vehicle
components:
  - name: Laser Emitter
    function: Emits laser pulses
  - name: Processing Unit
    function: Calculates distance from raw data
connections:
  - from: Power System
    to: all components
    description: Provides 24V DC power
safetyStandards: ["ISO 26262"]
```

**Simple Text Format:**
```
A brake system for an autonomous vehicle consisting of brake pedal, master cylinder, brake lines, and brake pads. The system uses hydraulic pressure to apply braking force and includes ABS functionality for safety.
```

### API Endpoints

- `POST /api/analysis/generate` - Generate FMECA and FTA analysis
- `POST /api/analysis/validate` - Validate input format
- `GET /api/analysis/examples` - Get example inputs
- `GET /api/health` - Health check endpoint

### Example API Usage

```javascript
const response = await fetch('/api/analysis/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: "Your system description here..."
  })
});

const analysis = await response.json();
console.log(analysis.results.fmeca);
console.log(analysis.results.fta);
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Test specific endpoint
curl -X POST http://localhost:3000/api/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation
- **XSS Protection**: Input sanitization
- **CORS**: Configurable cross-origin requests
- **Helmet.js**: Security headers
- **Non-root Docker User**: Container security

## 📊 Monitoring & Logging

The application includes comprehensive logging:

```bash
# View application logs
docker-compose logs -f gen-safe

# Check health status
curl http://localhost:3000/api/health
```

Log levels: `error`, `warn`, `info`, `debug`

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper `ALLOWED_ORIGINS` for CORS
- [ ] Set up SSL/HTTPS termination
- [ ] Configure log rotation
- [ ] Set up monitoring (health checks)
- [ ] Configure backup for any persistent data

### AWS Deployment Example

```bash
# Build and push to ECR
docker build -t gen-safe .
docker tag gen-safe:latest your-account.dkr.ecr.region.amazonaws.com/gen-safe:latest
docker push your-account.dkr.ecr.region.amazonaws.com/gen-safe:latest

# Deploy to ECS or Elastic Beanstalk
# (Configure environment variables in AWS console)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Mermaid.js for diagram rendering
- Express.js community
- Safety engineering standards organizations

## 📞 Support

For support, email support@gen-safe.com or open an issue on GitHub.

---

**Gen-SAFE** - Transforming Safety Analysis with AI 🛡️🤖
