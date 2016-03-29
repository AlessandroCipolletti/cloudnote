<div class="cloudnote-editor-colorpicker__container">

  <div class="cloudnote-editor-colorpicker__primary">
    <div class="cloudnote-editor-colorpicker__random-container">
      <div class="cloudnote-editor-colorpicker__random cloudnote-editor-colorpicker__random-selected"
    </div>
    {{#each primaryColors}}
      <div class="cloudnote-editor-colorpicker__color" data-color="{{this}}" style="background-color: {{this}}"></div>
    {{/each}}
    <div class="cloudnote-editor-colorpicker__showhide-container">
      <div class="cloudnote-editor-colorpicker__showhide"></div>
    </div>
  </div>

  <div class="cloudnote-editor-colorpicker__secondary">
    {{#each secondaryColors}}
      <div class="cloudnote-editor-colorpicker__color" data-color="{{this}}" style="background-color: {{this}}"></div>
    {{/each}}
  </div>

</div>
