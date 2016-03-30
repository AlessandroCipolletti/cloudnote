<div class="cloudnote-dashboard__container displayNone" style="height: calc(100% - {{marginTop}}px); top: {{marginTop}}px;">
  <svg version="1.1" class="cloudnote-dashboard__svg">
    <rect class="cloudnote-dashboard__zoom-label-rect" x="{{zoomRectCoord}}" y="{{zoomRectCoord}}" rx="{{zoomRectBorderRadius}}" ry="{{zoomRectBorderRadius}}" width="{{zoomRectWidth}}" height="{{zoomRectHeight}}"></rect>
    <text class="cloudnote-dashboard__zoom-label" x="{{zoomLabelX}}" y="{{zoomLabelY}}">100%</text>
  </svg>
  <a class="cloudnote-dashboard__showeditor button fadeIn">{{labelToDraw}}</a>
  <div class="cloudnote-dashboard__spinner fadeIn">
    <img class="cloudnote-dashboard__spinner-image" src="img/spinner.gif">
  </div>
</div>
