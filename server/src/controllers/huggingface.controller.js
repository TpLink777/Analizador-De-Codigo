const axios = require('axios');
const validate = require('./sintaxis.controller')
require('dotenv').config();

// Modelo para análisis de código (detecta calidad/problemas)
const MODEL_URL = 'https://api-inference.huggingface.co/models/microsoft/codebert-base';

exports.analyzeCode = async function (code) {
  try {

    const response = await axios.post(
      MODEL_URL,
      { inputs: code },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos
      }
    );

    return response.data;

  } catch (err) {
    console.error('Error en analyzeCode:', err);
    if (err.response?.status === 503) {
      throw new Error('Modelo cargándose, intenta en 20 segundos');
    }
    throw new Error(err.message || 'Error al analizar código');
  }
}

// Reglas heurísticas simples (detección de malas prácticas)
exports.detectIssues = function (code) {
  const issues = [];

  const syntaxCheck = validate.validateSyntax(code);
  if (!syntaxCheck.valid) {
    issues.push(syntaxCheck.error);
    return issues;
  }

  // Seguridad - uso de eval es peligroso
  if (code.includes('eval(')) {
    issues.push({ type: 'security', message: 'Uso de eval() detectado - riesgo seguridad' });
  }

  // Callbacks y async
  if ((code.match(/callback/gi) || []).length > 3) {
    issues.push({ type: 'performance', message: 'Múltiples callbacks - considera async/await' });
  }

  // Llamadas API sin manejo de errores
  if (!code.includes('try') && (code.includes('fetch') || code.includes('axios'))) {
    issues.push({ type: 'error-handling', message: 'Llamadas API sin try/catch' });
  }

  // Archivo grande
  if (code.length > 5000) {
    issues.push({ type: 'maintainability', message: 'Archivo muy largo (>5000 chars) - considera dividir' });
  }

  // Uso de var (mejor let/const)
  if (/\bvar\b/.test(code)) {
    issues.push({ type: 'style', message: 'Uso de var detectado - usar let/const' });
  }

  // Comparaciones no estrictas
  if (/[^=!]==[^=]/.test(code) || /!=[^=]/.test(code)) {
    issues.push({ type: 'bug-risk', message: 'Uso de ==/!= en vez de ===/!== - puede causar bugs' });
  }

  // Comentarios TODO/FIXME
  if (/(TODO|FIXME)/i.test(code)) {
    issues.push({ type: 'todo', message: 'Comentarios TODO/FIXME presentes - recuerda solucionar antes de release' });
  }

  // Posibles secretos hardcodeados
  if (/(api[_-]?key|apikey|password|passwd|secret|token|private[_-]?key|client_secret)/i.test(code) ||
    /(['"`])[A-Za-z0-9-_]{20,}\1/.test(code)) {
    issues.push({ type: 'security', message: 'Posible credencial hardcodeada detectada - mover a variables de entorno' });
  }

  // Operaciones síncronas de FS (bloqueantes en Node)
  if (/(readFileSync|writeFileSync|readdirSync|existsSync)/.test(code)) {
    issues.push({ type: 'performance', message: 'Operaciones síncronas de FS detectadas - considerar versión asíncrona' });
  }

  // Funciones muy largas (heurística por tamaño de bloque)
  (function detectLongFunctions() {
    const fnRegex = /function[^(]*\([^)]*\)\s*{([\s\S]*?)}/g;// sirve para detectar funciones largas
    const arrowRegex = /=>\s*{([\s\S]*?)}/g; // sirve para detectar arrow functions largas
    let m;

    while ((m = fnRegex.exec(code)) !== null) {
      if ((m[1] || '').length > 2000) {
        issues.push({ type: 'maintainability', message: 'Función larga detectada - considerar dividir en funciones más pequeñas' });
        break;
      }
    }
    while ((m = arrowRegex.exec(code)) !== null) {
      if ((m[1] || '').length > 2000) {
        issues.push({ type: 'maintainability', message: 'Arrow function larga detectada - considerar dividir' });
        break;
      }
    }
  })();

  return issues;
}


