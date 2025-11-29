const AnalyzeCodeController = require('./huggingface.controller')

exports.analizarYresponder = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Código inválido' });
        }

        if (code.length > 10000) {
            return res.status(400).json({ error: 'Código muy largo (máx 10k caracteres)' });
        }

        const localIssues = AnalyzeCodeController.detectIssues(code);

        const hasSyntaxError = localIssues.some(issue => issue.type === 'syntax-error');

        if (hasSyntaxError) {
            return res.json({
                success: false,
                hasSyntaxError: true,
                message: '⚠️ Corrige los errores de sintaxis antes de continuar',
                issues: localIssues,
                timestamp: new Date().toISOString()
            });
        }

        let aiAnalysis = null;
        try {
            aiAnalysis = await AnalyzeCodeController.analyzeCode(code);
        } catch (aiError) {
            console.error('Error IA:', aiError.message);
        }

        let score = 100;
        score -= localIssues.length * 15; // sirve para restar puntos por cada problema detectado
        score = Math.max(0, Math.min(100, score)); // sirve paea asegurar que el puntaje esté entre 0 y 100

        res.json({
            success: true,
            isSyntaxError: false,
            score, // puntaje de calidad del código
            level: score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : score >= 40 ? 'Regular' : 'Necesita mejoras',
            issues: localIssues,
            aiInsights: aiAnalysis, // análisis detallado de la IA
            timestamp: new Date().toISOString() // marca de tiempo del análisis
        });

    } catch (error) {
        console.error('Error en análisis:', error);
        res.status(500).json({ error: error.message });
    }
}