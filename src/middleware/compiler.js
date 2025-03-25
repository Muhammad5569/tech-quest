const axios = require('axios')
import "dotenv"

const SPHERE_ENGINE_API_URL = process.env.SPHERE_ENGINE_API_URL
const ACCESS_TOKEN = process.env.ACCESS_TOKEN


export const submission = async( code) => {
    return  await axios.post('https://d1cc0643.compilers.sphere-engine.com/api/v4/submissions?access_token=fb0c3388c46b37f5da145305ebc4df7d', code)
}
export const getSubmission = async( submissionId ) => {
    try {
    return await axios.get(`https://d1cc0643.compilers.sphere-engine.com/api/v4/submissions/${submissionId}?access_token=fb0c3388c46b37f5da145305ebc4df7d`)
    } catch (error) {
        console.error( {message: error.message})
    }
}

// export const getOutput = async (submissionId) => {
//     try {
//         return await axios.get(`https://d1cc0643.compilers.sphere-engine.com/api/v4/submissions/${submissionId}/output?access_token=fb0c3388c46b37f5da145305ebc4df7d`)
//     } catch (error) {
//         console.error( {message: error.message})
//     }
    
const getSubmissionResult = async (submissionId, retries = 5, delay = 1000) => {
    try {
        const response = await axios.get(
            `${SPHERE_ENGINE_API_URL}/submissions/${submissionId}?access_token=${ACCESS_TOKEN}`
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404 && retries > 0) {
            // Retry after a delay if the result is not ready
            console.log(`Result not ready. Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return getSubmissionResult(submissionId, retries - 1, delay);
        } else {
            // Throw the error if retries are exhausted or it's not a 404 error
            throw error;
        }
    }
};



export const pollSubmissionResult = async (submissionId, interval = 1000, maxAttempts = 30) => {
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const result = await getSubmissionResult(submissionId);
            // Check if the submission is finished
            
            if (result.result.status.code === 13) { // 15 = "finished"
                console.log('time limit exceeded', result);
                return result;
            }
            if (result.result.status.code === 15) { // 15 = "finished"
                //console.log('Submission finished:', result.result);
                const submissionID = result.id
                const output = await axios.get(`https://d1cc0643.compilers.sphere-engine.com/api/v4/submissions/${submissionID}/output?access_token=fb0c3388c46b37f5da145305ebc4df7d`)
                return output;
            }
            if(result.result.status.code ===15 ){
            }

            // Wait for the next poll
            await new Promise((resolve) => setTimeout(resolve, interval));
            attempts++;
        } catch (error) {
            console.error('Error polling submission result:', error);
            throw error;
        }
    }

    throw new Error('Max polling attempts reached. Submission may still be processing.');
};