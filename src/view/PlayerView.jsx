//Callback methods
var reactUpdateComponentCallbacks = {};

var PlayerView = React.createClass({
    render: function () {
        return (
            <div>
                <VideoMainView />
                <VideoControlContainer />
                <RepresentationsContainer />
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
                <AdaptationController />
                <MpdDetailsView/>
            </div>
        )
    }
});

var AdaptationController = React.createClass({
    getInitialState: function () {
        return {
            value: 'Off'
        };
    },

    adaptationChanged: function (event) {
        var adaptationValue = event.target.value;
        this.setState({value: adaptationValue});

        if (adaptationValue === 'Off') {
            dashPlayer.disableAdaptation();
        } else {
            dashPlayer.enableAdaptation(adaptationValue);
        }
    },

    render: function () {
        return (
            <div>
                <span>Adaptation algorithm:</span>
                <input type="button" value="Off" disabled={this.state.value === "Off"}
                       onClick={this.adaptationChanged}/>
                <input type="button" value="PID" disabled={this.state.value === "PID"}
                       onClick={this.adaptationChanged}/>
                <input type="button" value="Fuzzy" disabled={this.state.value === "Fuzzy"}
                       onClick={this.adaptationChanged}/>
            </div>
        );
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
            duration: mpdModel.getMediaPresentationDurationFormatted() + ' s',
            minBuffer: mpdModel.getMinBufferTimeFormatted() + ' s',
            videoSets: this.adaptationSetsToString(videoAdaptationSets),
            audioSets: this.adaptationSetsToString(audioAdaptationSets),
            textSets: this.adaptationSetsToString(textAdaptationSets)
        });
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.MPD_LOADED, this.updateMpdModelFromEvent);

        if (this.state) {
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

var RepresentationsContainer = React.createClass({
    getInitialState: function () {
        return {
            videoAdaptationSet: null,
            audioAdaptationSet: null,
            textAdaptationSet: null
        }
    },

    updateAdaptationSetFromEvent: function (event) {
        var adaptationSet = event.value;
        if (adaptationSet.isVideo()) {
            this.setState({videoAdaptationSet: adaptationSet})
        } else if (adaptationSet.isAudio()) {
            this.setState({audioAdaptationSet: adaptationSet})
        } else if (adaptationSet.isText()) {
            this.setState({textAdaptationSet: adaptationSet})
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, this.updateAdaptationSetFromEvent);

        return (
            <div>
                {this.state.videoAdaptationSet ?
                    <RepresentationController mediaType={Dash.model.MediaType.VIDEO}
                                              totalRepresentationsNumber={this.state.videoAdaptationSet.getRepresentations().length}/> : null }
                {this.state.audioAdaptationSet ?
                    <RepresentationController mediaType={Dash.model.MediaType.AUDIO}
                                              totalRepresentationsNumber={this.state.audioAdaptationSet.getRepresentations().length}/> : null }
                {this.state.textAdaptationSet ?
                    <RepresentationController mediaType={Dash.model.MediaType.TEXT}
                                              totalRepresentationsNumber={this.state.textAdaptationSet.getRepresentations().length}/> : null }
            </div>
        )
    }
});

var RepresentationController = React.createClass({
    getInitialState: function () {
        return {
            representationNumber: 0
        };
    },

    updateRepresentationFromEvent: function (event) {
        var representation = event.value;
        if (representation.getAdaptationSet().getMediaType() === this.props.mediaType) {
            this.setState({
                representationNumber: representation.orderNumber,
                id: representation.getId(),
                mimeType: representation.getMimeType(),
                codecs: representation.getCodecs(),
                bandwidth: representation.getBandwidth(),
                width: representation.getWidth(),
                height: representation.getHeight(),
                frameRate: representation.getFrameRate(),
                audioSamplingRate: representation.getAudioSamplingRate()
            });
        }
    },

    buttonType: {
        LEFT: 0,
        RIGHT: 1
    },

    printRepresentationPropertiesIfInitialized: function () {
        if (this.state.id) {
            return (
                <div>
                    <PropertyElement name="Id" value={this.state.id}/>
                    <PropertyElement name="Mime" value={this.state.mimeType}/>
                    <PropertyElement name="Codecs" value={this.state.codecs}/>
                    <PropertyElement name="Bandwidth" value={this.state.bandwidth}/>
                    {this.state.frameRate ?
                        <PropertyElement name='Frame rate' value={this.state.frameRate}/> : null}
                    {this.state.height ?
                        <PropertyElement name='Height' value={this.state.height}/> : null}
                    {this.state.width ?
                        <PropertyElement name='Width' value={this.state.width}/> : null}
                    {this.state.audioSamplingRate ?
                        <PropertyElement name='Audio sampling rate' value={this.state.audioSamplingRate}/> : null}
                </div>
            )
        } else {
            return '';
        }
    },

    changeRepresentation: function (event) {
        //fixme ugly as fuck
        var buttonInnerHtml = event.target.innerHTML;

        if (buttonInnerHtml === '&lt;') {
            dashPlayer.changeRepresentationToLower(this.props.mediaType, 1);
        } else if (buttonInnerHtml === '&gt;') {
            dashPlayer.changeRepresentationToHigher(this.props.mediaType, 1);
        }
    },

    shouldButtonBeDisabled: function (buttonType) {
        if (buttonType === this.buttonType.LEFT) {
            return this.state.representationNumber === 0 || this.state.representationNumber === 1;
        } else if (buttonType === this.buttonType.RIGHT) {
            return this.state.representationNumber === 0 || this.state.representationNumber === this.props.totalRepresentationsNumber;
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_INITIALIZED, this.updateRepresentationFromEvent);
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_CHANGED, this.updateRepresentationFromEvent);

        return (
            <div>
                <div>
                    <button onClick={this.changeRepresentation}
                            disabled={this.shouldButtonBeDisabled(this.buttonType.LEFT)}>&lt;</button>
                    <span>{this.props.mediaType.name}</span>
                    <span>{this.state.representationNumber} / {this.props.totalRepresentationsNumber} </span>
                    <button onClick={this.changeRepresentation}
                            disabled={this.shouldButtonBeDisabled(this.buttonType.RIGHT)}>&gt;</button>
                </div>
                {this.printRepresentationPropertiesIfInitialized()}
            </div>
        );
    }
});




