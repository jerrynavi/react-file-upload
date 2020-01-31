# Better File Uploads in React using axios and React Circular Progressbar

## Introduction

Ever tried to upload a file? On most websites, when you click on the submit button on a file upload form, you get the feeling of being stuck in limbo because the page just loads until the upload is done. If you are uploading your file on a slow connection, what you get is

![Stuck](https://media.tenor.com/images/643f45993020043f1898807f177e097a/tenor.gif)

In this guide, we will take a different approach to file uploads by displaying the progress of an upload.

---

Let's go ahead and bootstrap a React app using [create-react-app](https://create-react-app.dev)

```bash
npx create-react-app my-app --template typescript
```

When the installation is completed, `cd` into the project directory and run the following command

`yarn add axios react-circular-progressbar`

to install Axios and a React progressbar component (there's tons of progress indicators for React on NPM!). Axios is our HTTP client for making requests to our app's API. We will not be concerned with the implementation details of an API at the moment, so I've gone ahead to mock responses for a successful and a failed request.

When that's done, let's go straight to writing code. Our project folder should look something like this:

```bash
├── README.md
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src
│   ├── App.css
│   ├── App.test.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── index.tsx
│   ├── logo.svg
│   ├── react-app-env.d.ts
│   ├── serviceWorker.ts
│   └── setupTests.ts
├── tsconfig.json
└── yarn.lock
```

Open up `App.tsx` and replace the contents with this:

```jsx
import React, { FC } from 'react';
import './App.css';

const App: FC = (): JSX.Element => {
    return (
        <div className="app">
            <div className="image-preview-box">
            </div>

            <form className="form">
                <button className="file-chooser-button" type="button">
                    Choose File
                    <input
                        className="file-input"
                        type="file"
                        name="file" />
                </button>
                <button className="upload-button" type="submit">
                    Upload
                </button>
            </form>
        </div>
    );
}

export default App;
```

What we have now is an empty div for previewing an uploaded image and a form setup with a file input. Let's add some CSS to make things pretty.
![Pretty gif](https://media.tenor.com/images/8bcf39d6f2b69f70f43993d9f208c9db/tenor.gif)
Open the `App.css` file and replace the existing contents with the following:

```css
.app {
    display: flex;
    height: 100vh;
    width: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.image-preview-box {
    width: 200px;
    height: 200px;
    border: 1px solid rgba(0,0,0,0.3);
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.form {
    display: flex;
    flex-direction: column;
    position: relative;
}

.form > * {
    margin: 0.5em auto;
}

.file-chooser-button {
    border: 1px solid teal;
    padding: 0.6em 2em;
    position: relative;
    color: teal;
    background: none;
}

.file-input {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
}

.upload-button {
    background: teal;
    border: 1px solid teal;
    color: #fff;
    padding: 0.6em 2em;
}
```

Now let's go back to the template and set up our form to - for the purpose of this project - validate and accept images smaller than 2mb.

Add the following to the top of our component:

```diff
+ const [file, setFile] = useState();
```

Change the following in `App.tsx`:

```diff
- <input
-    className="file-input"
-    type="file"
-    name="file" />
+ <input
+    className="file-input"
+    type="file"
+    name="file"
+    accept={acceptedTypes.toString()}
+    onChange={(e) => {
+        if (e.target.files && e.target.files.length > 0) {
+            setFile(e.target.files[0])
+        }
+    }} />
```

We are currently accepting files that match some criteria, and saving the file to the Function Component state if it passes validation. The `accept` attribute value is a string that defines the file types the file input should accept. This string is a comma-separated list of unique file type specifiers. The `files` attribute is a FileList object that lists every selected file (only one, unless the multiple attribute is specified).[<sup>1</sup>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)

For flexibility, you can add this array just after the last line of imports in `App.tsx`:

```ts
const acceptedTypes: string[] = [
    'image/png',
    'image/jpg',
    'image/jpeg',
];
```

Next we will import Axios and attempt to submit the user selected file to our (mock) API. Add the axios import:

```diff
+ import axios from 'axios';
```

and add the following code at the top of the App component:

```ts
const [uploadProgress, updateUploadProgress] = useState(0);
const [imageURI, setImageURI] = useState<string|null>(null);
const [uploadStatus, setUploadStatus] = useState(false);
const [uploading, setUploading] = useState(false);

const getBase64 = (img: Blob, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

const isValidFileType = (fileType: string): boolean => {
    return acceptedTypes.includes(fileType);
};

const handleFileUpload = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidFileType(file.type)) {
        alert('Only images are allowed (png or jpg)');
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    axios({
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: formData,
        url: 'http://www.mocky.io/v2/5e29b0b93000006500faf227',
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
```

It feels like a lot is going on here, but all we are doing is

- preventing the default form submit action
- validating the file type using Javascript (¯\_(ツ)_/¯)
- creating a `FormData` object and adding the file we have in state to the object
- submitting an axios `POST` request
- getting the current upload progress and saving it as a percentage value to our app's state using axios' `onUploadProgress()` [config](https://www.npmjs.com/package/axios#request-config) option
- marking the upload as done in our state (useful later to show our photo preview)
- and making sure None Shall Pass&trade;

Of course we will need to update our form to account for the new changes:

```diff
- <form className="form">
+ <form onSubmit={handleFileUpload} className="form">
```

We will also need to update the empty div and make it show a preview of our uploaded file:

```diff
<div className="image-preview-box">
+ {(uploadStatus && imageURI)
+     ? <img src={imageURI} alt="preview" />
+     : <span>A preview of your photo will appear here.</span>
+ }
</div>
```

To wrap things up, let's import our progress component and set it up. First, add the following to the app's imports:

```diff
+ import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
+ import "react-circular-progressbar/dist/styles.css";
```

Then add this just after the closing `</form>` tag:

```jsx
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
```

All done! We have been able to inspect and show our users what happens with their upload as it happens. We can extend this further by make it possible for users to cancel their uploads[<sup>2</sup>](https://www.npmjs.com/package/axios#cancellation) if it's progressing slowly.

You can find the project source code [here](https://github.com/jerrynavi/react-file-upload). Feel free to check it out and let me know what you think in the comments.

## References

1. [HTML input element on MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file)
2. [Axios docs](https://www.npmjs.com/package/axios#cancellation)
