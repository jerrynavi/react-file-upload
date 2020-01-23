import React, { FC, useState, FormEvent } from 'react';
import './App.css';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import "react-circular-progressbar/dist/styles.css";

const UPLOAD_SUCCESS_URL = "http://www.mocky.io/v2/5e29b0b93000006500faf227";
// const UPLOAD_FAILED_URL ='http://www.mocky.io/v2/5e29b0a5300000cd68faf225';

const App: FC = (): JSX.Element => {
    const [file, setFile] = useState();
    const [uploadProgress, updateUploadProgress] = useState(0);
    const [imageURI, setImageURI] = useState<string|null>(null);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploading, setUploading] = useState(false);

    const getBase64 = (img: Blob, callback: any) => {
        const reader = new FileReader();
        // FileReader API Spec: https://developer.mozilla.org/en-US/docs/Web/API/FileReader/FileReader
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    const handleFileUpload = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        axios({
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
            url: UPLOAD_SUCCESS_URL,
            onUploadProgress: (ev: ProgressEvent) => {
                const progress = ev.loaded / ev.total * 100;
                updateUploadProgress(Math.round(progress));
            },
        })
        .then((resp) => {
            // our mocked response will always return true
            // in practice, you would want to use the actual response object
            setUploadStatus(true);
            setUploading(false);
            getBase64(file, (uri: string) => {
                setImageURI(uri);
            });
        })
        .catch((err) => console.error(err));
    };

    return (
        <div className="app">
            <div className="image-preview-box">
                {(uploadStatus && imageURI)
                    ? <img src={imageURI} alt="preview" />
                    : <span>A preview of your photo will appear here.</span>
                }
            </div>

            <form onSubmit={handleFileUpload} className="form">
                <button className="file-chooser-button" type="button">
                    {(file)
                        ? '1 file selected'
                        : 'Choose File'
                    }
                    <input
                        className="file-input"
                        type="file" name="file"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setFile(e.target.files[0])
                            }
                        }} />
                </button>
                <button className="upload-button" type="submit">
                    Upload
                </button>
            </form>
            
            {(uploading)
                ?
                <div className="progress-bar-container">
                    <CircularProgressbar
                        value={uploadProgress}
                        text={`${uploadProgress}% uploaded`}
                        styles={buildStyles({
                            textSize: '10px',
                            pathColor: 'teal',
                        })}
                    />
                </div>
                : null
            }

        </div>
    );
}

export default App;
