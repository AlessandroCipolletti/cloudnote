<div class="drawith-editor-colorpicker__container">

  <div class="drawith-editor-colorpicker__primary">
    <div class="drawith-editor-colorpicker__random-container">
      <div class="drawith-editor-colorpicker__random drawith-editor-colorpicker__random-selected"></div>
    </div>
    {{#each primaryColors}}
      <div class="drawith-editor-colorpicker__color" data-color="{{this}}" style="background-color: {{this}}"></div>
    {{/each}}
    {{#if secondaryColors}}
      <div class="drawith-editor-colorpicker__showhide-container">
        <div class="drawith-editor-colorpicker__showhide"></div>
      </div>
    {{/if}}
  </div>

  {{#if secondaryColors}}
    <div class="drawith-editor-colorpicker__secondary">
      {{#each secondaryColors}}
        <div class="drawith-editor-colorpicker__color" data-color="{{this}}" style="background-color: {{this}}"></div>
      {{/each}}
    </div>
  {{/if}}

</div>
