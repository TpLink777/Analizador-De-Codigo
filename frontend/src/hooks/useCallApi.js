import React, { useState } from 'react'
import axios from 'axios';

export const useCallApi = () => {

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL


    const handelInputs = ({ target }) => {
        const { value } = target;
        setCode(value);
    }


    const analyzeCode = async () => {

        if (!API_URL) {
            throw new Error('⚠️ API_URL no definida. Verifica el archivo .env');
        }

        if (!code.trim()) {
            setError('Escribe código para analizar');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(`${API_URL}/api/huggingface/analyze`, {
                code,
                language: 'javascript'
            });

            if(response.data.hasSyntaxError){
                setResult({
                ...response.data,
                isSyntaxError: response.data.hasSyntaxError
            })
            }else{

                setResult(response.data);
            }

            
        } catch (err) {
            setError(err.response?.data?.error || 'Error al analizar');
        } finally {
            setLoading(false);
        }
    };

    return {
        handelInputs,
        loading,
        result,
        error,
        analyzeCode,
        code
    }
}


