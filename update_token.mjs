import https from 'https';

const projectId = 'vietbachcorp-6cd8c';
const accessToken = 'iY711sWsb6osASy7RpwUPx4dn0Ti9yObp4Z7C54ZrLRoU-9GTpR3PQvVxq0C9zLwb6xGTqSXmKV2Ri1UItBLO-i_X6HULBLfvYsKVMLKZshN59zwH4wKMFWNZr9-VOjlfZ-jU1rv_tYnBjDe7p3AJxvvoqiG2FzIlql-ImeavrU8ViTN9ptoHuT6n7Cf0iP8zcZKS7e0xL3Z7FXcOG3nVVm3rtnONeHjvpxNI48ems_DIEnv5b3f1fCey3eSG_8PfnpY3HzRrHF2F8OI75sF9wu1cpCbPgumbd6d8H86hH2qQxyx9cYo9FumcIviP9mGi3km1pnjuH7W0ECGJKJr3vS7-oWaOlOqkYR3FXTUZIV9GuDDIspgBcDIR26MOG';

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/system_settings/zalo_config?updateMask.fieldPaths=accessToken`;

const postData = JSON.stringify({
    fields: {
        accessToken: { stringValue: accessToken }
    }
});

const options = {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Update Result:', data);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.write(postData);
req.end();
