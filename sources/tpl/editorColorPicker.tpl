<div class="drawith-editor-colorpicker__container">

  <div class="drawith-editor-colorpicker__random-container">
    <div class="drawith-editor-colorpicker__random drawith-editor-colorpicker__random-selected"></div>
  </div>
  <div class="drawith-editor-colorpicker__colors-container">
    <div>
      {{#each colors}}
        <div class="drawith-editor-colorpicker__color" data-color="{{this}}" style="background-color: {{this}}"></div>
      {{/each}}
    </div>
  </div>

</div>
