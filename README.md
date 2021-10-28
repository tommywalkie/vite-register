# vite-register

[**_Proof-of-Concept_**] Ever tried testing Vite project components relying on env variables ? Use this require hook.

```sh
npm install -D vite-register
echo 'VITE_FOO="hello world"' > .env
echo 'console.log(import.meta.env.VITE_FOO);' > index.js
node -r vite-register index.js
> hello world
```

