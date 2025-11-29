import React from 'react'
import '../assets/css/style.css'
import { useCallApi } from '../hooks/useCallApi'

const Analizador = () => {
    const { handelInputs, loading, result, error, analyzeCode, code } = useCallApi();

    return (
        <>
            <div className="container">
                <header>
                    <h1>🤖 Analizador de Código basico con IA</h1>
                    <p>Detecta problemas y mejora tu código con inteligencia artificial</p>
                </header>

                <div className="editor-section">
                    <label>Pega tu código:</label>
                    <textarea
                        value={code}
                        onChange={handelInputs}
                        placeholder="function ejemplo() { ... }"
                        rows={15}
                    />

                    <button
                        onClick={analyzeCode}
                        disabled={loading}
                        className="analyze-btn"
                    >
                        {loading ? '⏳ Analizando...' : '🔍 Analizar Código'}
                    </button>
                </div>

                {error && (
                    <div className="error-box">❌ {error}</div>
                )}

                {result && (
                    <div className="results">
                        {result.isSyntaxError ? (
                            <>
                                <div className="syntax-error-card">
                                    <h2>❌ Error de Sintaxis Detectado</h2>
                                    <p className="error-message">{result.message}</p>
                                </div>

                                <div className="issues-section">
                                    <h3>🔍 Errores encontrados:</h3>
                                    {result.issues.map((issue, i) => (
                                        <div key={i} className="issue syntax-error">
                                            <strong>
                                                {issue.line && `Línea ${issue.line}: `}
                                            </strong>
                                            {issue.message}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`score-card ${result.level.toLowerCase()}`}>
                                    <h2>Puntuación: {result.score}/100</h2>
                                    <p className="level">{result.level}</p>
                                </div>

                                {result.issues.length > 0 && (
                                    <div className="issues-section">
                                        <h3>⚠️ Problemas detectados:</h3>
                                        {result.issues.map((issue, i) => (
                                            <div key={i} className={`issue ${issue.type}`}>
                                                <strong>{issue.type}:</strong> {issue.message}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {result.issues.length === 0 && (
                                    <div className="success-box">
                                        ✅ ¡Excelente! No se detectaron problemas obvios
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default Analizador
