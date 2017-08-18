var PlayerControllerPanel = React.createClass({
    render: function () {
        return (
            <div className="row">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        Player controller
                    </div>
                    <div className="panel-body">
                        <VideoMainView />
                        <VideoControlContainer />
                    </div>
                </div>
            </div>
        )
    }
});


var VideoMainView = React.createClass({
    render: function () {
        return (
            <div className="col-md-8">
                <video id="dashVideoElement" width="100%" height="100%" ref="video" controls></video>
            </div>
        )
    },
    componentDidMount: function() {
        // after rendering, attach to player object
        dashPlayer.setVideoElement(this.refs.video.getDOMNode());
        $('[data-toggle="tooltip"]').tooltip();
    },
});

var VideoControlContainer = React.createClass({
    render: function () {
        return (
            <div className="col-md-4">
                <ul className="list-group">
                    <MpdDetailsView/>
                    <li className="list-group-item"><AdaptationControlView/></li>
                    <li className="list-group-item"><QualityControlView
                        mediaType={Dash.model.MediaType.VIDEO}/></li>
                    <li className="list-group-item"><QualityControlView
                        mediaType={Dash.model.MediaType.AUDIO}/></li>
                    <li className="list-group-item"><BatterySavingControlView/></li>
                </ul>
            </div>
        )
    }
});

var AdaptationControlView = React.createClass({
    getInitialState: function () {
        return {
            value: 'Off'
        };
    },

    adaptationChanged: function (event) {
        var adaptationValue = event.target.innerHTML;
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
                <span id="adaptationLabel">Adaptation active</span> &nbsp;

                <div className="btn-group" role="group" aria-label="adaptationLabel">
                    <button className="btn btn-default" type="button" disabled={this.state.value === "Off"}
                            onClick={this.adaptationChanged}>Off
                    </button>
                    <button className="btn btn-default" type="button" disabled={this.state.value === "PID"}
                            onClick={this.adaptationChanged}>On
                    </button>
                </div>
            </div>
        );
    }
});


var QualityControlView = React.createClass({

    getInitialState: function () {
        return {
            representations: [],
            chosen: null,
            updating: true
        };
    },

    getRepresentationIdByShortName: function (name) {
        for (var i = 0; i < this.state.representations.length; i += 1) {
            if (this.state.representations[i].name === name) {
                return this.state.representations[i].id;
            }
        }
    },

    changeRepresentation: function (event) {
        event.preventDefault();

        var representationName = event.target.innerHTML,
            representationId = this.getRepresentationIdByShortName(representationName);

        React.findDOMNode(this.refs.dropDownButton).innerHTML = "Changing...";
        this.setState({updating: true});
        dashPlayer.changeRepresentation(this.props.mediaType, representationId);
    },

    onAdaptationSetInitialized: function (event) {
        var adaptationSet = event.value;
        if (adaptationSet.getMediaType() === this.props.mediaType) {
            var representations = adaptationSet.getRepresentations().map(function (element) {
                return {id: element.getId(), name: element.toShortForm()};
            });
            this.setState({representations: representations});
        }
    },

    onRepresentationChanged: function (event) {
        var representation = event.value;
        if (representation.getAdaptationSet().getMediaType() === this.props.mediaType) {
            React.findDOMNode(this.refs.dropDownButton).innerHTML = representation.toShortForm();
            this.setState({updating: false, chosen: representation.toShortForm()});
        }
    },

    getTitle: function () {
        switch (this.props.mediaType) {
            case Dash.model.MediaType.VIDEO:
                return "Video representation";
            case Dash.model.MediaType.AUDIO:
                return "Audio representation";
            case Dash.model.MediaType.TEXT:
                return "Text representation";
        }
    },

    getOptions: function () {
        if (this.state.representations.length <= 0) {
            return '';
        } else {
            var self = this;
            return this.state.representations.map(function (representation) {
                return <li
                    className={self.state.updating || representation.name === self.state.chosen ? "disabled" : ""}>
                    <a href="#" onClick={self.changeRepresentation}>{representation.name}</a>
                </li>
            });
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_INITIALIZED, this.onRepresentationChanged);
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_CHANGED, this.onRepresentationChanged);
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, this.onAdaptationSetInitialized);

        return (
            <div>
                <span>{this.getTitle()}</span> &nbsp;

                <div className="btn-group">
                    <button type="button" ref="dropDownButton" className="btn btn-default dropdown-toggle"
                            data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                        Change
                        <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                        {this.getOptions()}
                    </ul>
                </div>
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
            var adaptationSetsMimes = adaptationSets.map(function (element) {
                return element.getMimeType();
            }).join(', ');

            string += ' (' + adaptationSetsMimes + ')';
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
                <li className="list-group-item">
                    <div>
                        <h4>MPD Details</h4>
                        <PropertyElement name='Type' value={this.state.type}/>
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
                </li>
            )
        } else {
            return (
                <div></div>
            );
        }
    }
});

var BatterySavingControlView = React.createClass({
    getInitialState: function() {
        return {batteryOptimizationAvailable: false};
    },
    render: function() {
        eventBus.addEventListener(Dash.event.Events.BATTERY_OUTAGE_PREDICTION, this.onBatteryOutagePrediction);
        return (
                <div>
        <div className="btn-group">
        <button className="btn btn-default" onClick={this.testOnEmulateLowBattery}
        data-toggle="tooltip" data-placement="top" title="This two buttons are currently just for demonstration. In final version, this will be invoked on right moment by itself"
        >Enable low battery emulation</button>
        <button className="btn btn-default" onClick={this.testOnDisableEmulateLowBattery}>Disable low battery emulation</button>
        </div>
                {this.state.batteryOptimizationAvailable ? this.getBatteryOptimizationWidget() : ''}
                <div className="modal fade" id="batteryOptimizationWarning" tabindex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title">Battery optimization</h4>
                    </div>
                    <div className="modal-body">
                      You have only 10% battery left. Probably you won't be able to
                      finish playback. You can turn on battery optimization so battery
                      will last longer.
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-default" data-dismiss="modal">I'm ok, don't want it</button>
                      <button type="button" className="btn btn-primary">Enable battery optimization</button>
                    </div>
                  </div>
                </div>
              </div>
             </div>
        );
    },
    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },
    getBatteryOptimizationWidget: function() {
        return (
            <div className="battery-optimization-settings">
                <input type="checkbox" id="enable-battery-optimization"/>
                <label htmlFor="enable-battery-optimization">Enable battery usage optimization</label>
            </div>
        );
    },
    onBatteryOutagePrediction: function(event) {
        if (event.available) {
            if (!this.state.batteryOptimizationAvailable) {
                $('#batteryOptimizationWarning').modal();
                this.setState({batteryOptimizationAvailable: true});
            }
        }
        else {
            this.setState({batteryOptimizationAvailable: false});
        }
    },
    testOnEmulateLowBattery: function() {
        eventBus.dispatchEvent({type: Dash.event.Events.BATTERY_OUTAGE_PREDICTION, available: true});
    },
    testOnDisableEmulateLowBattery: function() {
        eventBus.dispatchEvent({type: Dash.event.Events.BATTERY_OUTAGE_PREDICTION, available: false});
    }
});
