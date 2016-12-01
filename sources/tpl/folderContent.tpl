<div class="drawith-folder__drawing drawith-folder__drawing-new"></div>

{{#each drawings}}
  <div class="drawith-folder__drawing {{#if this.draft}}drawith-folder__drawing-draft{{/if}}" data-id="{{this.id}}" data-index="{{@index}}" style="background: url('{{this.localPathBig}}') no-repeat center , url('img/paper/white.png'); background-size: cover, auto;">
    {{#if this.draft}}<div class="drawith-folder__drawing-draft-icon"></div>{{/if}}
  </div>
{{/each}}
