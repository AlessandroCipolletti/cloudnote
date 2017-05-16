<div class="drawith-editor-tools__container">

  {{#each tools}}
    <div class="drawith-editor-tools__tool drawith-editor-tools__tool-{{this.name}} {{#if this.disabled}} disabled {{/if}}" data-tool="{{this.name}}"></div>
  {{/each}}

</div>

<div class="drawith-editor-tools__versions-container">

  {{#each tools}}
    {{#if this.versions}}
      <div class="drawith-editor-tools__versions drawith-editor-tools__versions-{{this.name}}">
        {{#each this.versions}}
          {{#if this.button}}
            <div class="drawith-editor-tools__versions-button{{#if this.params.image}} drawith-editor-tools__versions-button-image{{/if}}" data-versionsIndex="{{@index}}"><p>{{this.name}}</p></div>
          {{else if this.slider}}

          {{/if}}
        {{/each}}
      </div>
    {{/if}}
  {{/each}}

</div>
