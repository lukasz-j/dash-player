//Callback methods
var reactUpdateComponentCallbacks = {};

var PlayerView = React.createClass({
    render: function () {
        return (
            <div>
                <VideoMainView />
                <VideoControlContainer />
            </div>
        )
    }
});

var VideoMainView = React.createClass({
    render: function () {
        return (
            <div>
                <SourceLoadView/>
            </div>
        )
    }
});

var SourceLoadView = React.createClass({
    getInitialState: function () {
        return {
            videoSource: 'mpd'
        }
    },

    corsShouldBeEnabledAlert: function () {
        if (this.state.videoSource === 'youtube') {
            return (
                <div>
                    wloncz CORSA
                </div>
            );
        } else {
            return '';
        }
    },

    onVideoSourceChanged: function (event) {
        this.setState({videoSource: event.target.value});
    },

    loadVideoSource: function (event) {
        var sourceURL = React.findDOMNode(this.refs.sourceURL).value;
        dashPlayer.load(sourceURL, this.state.videoSource === 'youtube');
    },

    render: function () {
        return (
            <div>
                <label for="sourceType">Source:</label>

                <select value={this.state.videoSource} onChange={this.onVideoSourceChanged}>
                    <option value="mpd">MPD file</option>
                    <option value="youtube">YouTube</option>
                </select>

                <input type="text" ref="sourceURL"/>
                <input type="button" value="Load" onClick={this.loadVideoSource}/>
                {this.corsShouldBeEnabledAlert()}
                <div>
                    <video id="dashVideoElement" width="640" height="360" controls></video>
                </div>
            </div>
        );
    }
});

var VideoControlContainer = React.createClass({
    render: function () {
        return (
            <div>
                <MpdDetailsView/>
            </div>
        )
    }
});

var MpdDetailsView = React.createClass({
    getInitialState: function () {
        return null;
    },

    adaptationSetsToString: function (adaptationSets) {
        var string = adaptationSets.length.toString();

        if (adaptationSets.length > 0) {
            var adaptationSetsMimes = [];
            adaptationSets.forEach(function (element) {
                adaptationSetsMimes.push(element.getMimeType());
            });

            string += ' (' + adaptationSetsMimes.join(', ') + ')';
        }
        return string;
    },

    updateMpdModelFromEvent: function (event) {
        var mpdModel = event.value,
            videoAdaptationSets = mpdModel.getPeriod().getVideoAdaptationSets(),
            audioAdaptationSets = mpdModel.getPeriod().getAudioAdaptationSets(),
            textAdaptationSets = mpdModel.getPeriod().getTextAdaptationSets();

        this.setState({
            type: mpdModel.getType().name,
            profiles: mpdModel.getProfilesAsString(),
            duration: mpdModel.getMediaPresentationDurationFormatted(),
            minBuffer: mpdModel.getMinBufferTimeFormatted(),
            videoSets: this.adaptationSetsToString(videoAdaptationSets),
            audioSets: this.adaptationSetsToString(audioAdaptationSets),
            textSets: this.adaptationSetsToString(textAdaptationSets)
        });
    },

    render: function () {
        reactUpdateComponentCallbacks.mpdLoaded = this.updateMpdModelFromEvent;

        if (this.state) { //TODO should it be this way?
            return (
                <div>
                    <h1>MPD Info</h1>
                    <PropertyElement name='MPD type' value={this.state.type}/>
                    <PropertyElement name='Profiles' value={this.state.profiles}/>
                    <PropertyElement name='Duration' value={this.state.duration}/>
                    <PropertyElement name='Min buffer' value={this.state.minBuffer}/>
                    { this.state.videoSets ?
                        <PropertyElement name='Video sets' value={this.state.videoSets}/> : null}
                    { this.state.audioSets ?
                        <PropertyElement name='Audio sets' value={this.state.audioSets}/> : null}
                    { this.state.textSets ?
                        <PropertyElement name='Text sets' value={this.state.textSets}/> : null}
                </div>
            )
        } else {
            return (
                <div></div>
            );
        }
    }
});

var PropertyElement = React.createClass({
    render: function () {
        return (
            <div>{this.props.name} : {this.props.value} </div>
        )
    }
});

/*
 var RepresentationsContainer = React.createClass({
 getInitialState: function () {
 return {
 videoAdaptationSet: { getRepresentations: function(){return [1,2]}},
 audioAdaptationSet: undefined,
 textAdaptationSet: undefined
 }
 },

 render: function () {
 return (
 <div>
 {this.state.videoAdaptationSet ? <RepresentationController mediaType=" video"
 availableRepresentationsNumber={this.state.videoAdaptationSet.getRepresentations().length}/> : null }
 {this.state.audioAdaptationSet ? <RepresentationController mediaType=" audio"/> : null }
 {this.state.textAdaptationSet ? <RepresentationController mediaType=" text"/> : null }
 </div>
 )
 }
 });

 var RepresentationController = React.createClass({
 getInitialState: function () {
 return {
 id: ""
 };
 },

 updateCurrentRepresentation: function (representation) {
 var adaptationSet = representation.getAdaptationSet(),
 availableRepresentations = representation.getAdaptationSet().getRepresentations();

 this.setState({
 currentRepresentationNumber = availableRepresentations.indexOf(representation),
 availableRepresentationsNumber = availableRepresentations.length,

 id: representation.getId(),
 mimeType: representation.getMimeType(),
 codecs: representation.getCodecs(),
 bandwidth: representation.getBandwidth(),
 width: representation.getWidth(),
 height: representation.getHeight(),
 frameRate: representation.getFrameRate(),
 audioSamplingRate: representation.getAudioSamplingRate()
 });
 },

 render: function () {
 return (
 <div>
 <button>&lt;</button>
 <span>{this.props.mediaType}</span>
 <span>{this.state.currentRepresentationNumber} / {this.props.availableRepresentationsNumber} </span>
 <button>&gt;</button>
 <ul>
 <li>{this.state.id}</li>
 </ul>
 </div>
 );
 }
 });
 */




