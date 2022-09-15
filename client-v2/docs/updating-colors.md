# Updating the colors
To update the app colors used through tailwind, follow these steps:
1. Copy the colors from figma
    - Open the figma file
    - Open the plugin [Color Import / Export](https://www.figma.com/community/plugin/1143682832255826428)
    - Select all colors from the pallete
    - Select Language 'JSON' and Casing 'Dot'
    - Click 'Copy to Clipboard'
2. Run the following command with the colors as input:
    ```sh
    npm run update-colors '<your copied color object>'
    ```

The colors should now be in sync with the figma file.