var PlayerView = React.createClass({
    render: function () {
        return (
            <div className="container">
                <SourceLoadView />

                <VideoMainView />

                <DebugInfoContainer />
            </div>
        );
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
                <div className="alert alert-warning" role="alert">
                    <strong>Warning!</strong> You need browser plugin installed which change CORS header in HTTP
                    responses to allow proper streaming from YouTube. &nbsp;
                    <a href="https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi"
                       className="alert-link">Plugin for Chrome</a>
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

    getSourcePlaceholder: function () {
        if (this.state.videoSource === "youtube") {
            return "YouTube movie URL";
        } else {
            return "MPD file URL";
        }
    },

    render: function () {
        return (
            <div>
                <div className="row sourceLoadView">
                    <div className="col-md-2 sourceSelect">
                        <select className="form-control" id="sourceType" value={this.state.videoSource}
                                onChange={this.onVideoSourceChanged}>
                            <option value="mpd">MPD file</option>
                            <option value="youtube">YouTube</option>
                        </select>
                    </div>

                    <div className="col-md-10 sourceInput">
                        <div className="input-group">
                            <input type="text" className="form-control" ref="sourceURL"
                                   placeholder={this.getSourcePlaceholder()}/>
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button" onClick={this.loadVideoSource}>
                                        Load
                                    </button>
                                </span>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {this.corsShouldBeEnabledAlert()}
                </div>
            </div>
        );
    }
});

var VideoMainView = React.createClass({
    render: function () {
        return (
            <div className="row">
                <VideoElement />
                <VideoControlContainer />
            </div>
        )
    }
});


var VideoElement = React.createClass({
    render: function () {
        return (
            <div className="col-md-8">
                <video id="dashVideoElement" width="100%" height="100%" controls></video>
            </div>
        )
    }
});

var VideoControlContainer = React.createClass({
    render: function () {
        return (
            <div className="col-md-4">
                <div className="panel panel-primary">
                    <div className="panel-heading">Player controller</div>

                    <MpdDetailsView/>

                    <ul className="list-group">
                        <li className="list-group-item"><AdaptationController/></li>
                        <li className="list-group-item"><QualityController
                            mediaType={Dash.model.MediaType.VIDEO}/></li>
                        <li className="list-group-item"><QualityController
                            mediaType={Dash.model.MediaType.AUDIO}/></li>
                    </ul>
                </div>
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
                <span id="adaptationLabel">Adaptation method</span>

                <div className="btn-group" role="group" aria-label="adaptationLabel">
                    <button className="btn btn-default" type="button" disabled={this.state.value === "Off"}
                            onClick={this.adaptationChanged}>Off
                    </button>
                    <button className="btn btn-default" type="button" disabled={this.state.value === "PID"}
                            onClick={this.adaptationChanged}>PID
                    </button>
                    <button className="btn btn-default" type="button" disabled={this.state.value === "Fuzzy"}
                            onClick={this.adaptationChanged}>Fuzzy
                    </button>
                </div>
            </div>
        );
    }
});


var QualityController = React.createClass({

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
                <span>{this.getTitle()}</span>

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

    getClassNameForContainer: function () {
        var className = "panel-body ";
        if (this.state) {
            className += "show";
        } else {
            className += "hidden";
        }

        return className;
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
                <div className={this.getClassNameForContainer()}>
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

var DebugInfoContainer = React.createClass({

    getInitialState: function () {
        return {activeTab: "Representations"}
    },

    onTabChanged: function (event) {
        event.preventDefault();
        this.setState({activeTab: event.target.innerHTML});
    },

    getClassForTab: function (tabName) {
        if (tabName === this.state.activeTab) {
            return "active";
        } else {
            return "";
        }
    },

    render: function () {
        return (
            <div className="row">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        Media debug info
                    </div>
                    <div className="panel-body">
                        <ul className="nav nav-tabs">
                            <li role="presentation" className={this.getClassForTab("Representations")}
                                onClick={this.onTabChanged}><a href="#">Representations</a>
                            </li>
                            <li role="presentation" className={this.getClassForTab("Logs")}
                                onClick={this.onTabChanged}><a href="#">Logs</a>
                            </li>
                        </ul>
                        <RepresentationsContainer isActive={this.state.activeTab === "Representations"}/>
                        <LogContainer isActive={this.state.activeTab === "Logs"}/>
                    </div>
                </div>
            </div>
        );
    }
});


var RepresentationsContainer = React.createClass({
    getInitialState: function () {
        return {
            initialized: false,
            videoAdaptationSet: null,
            audioAdaptationSet: null,
            textAdaptationSet: null
        }
    },

    getClassForContainer: function () {
        var className = '';
        if (this.props.isActive) {
            className += "show";
        } else {
            className += "hidden";
        }
        return className;
    },

    updateAdaptationSetFromEvent: function (event) {
        var adaptationSet = event.value;
        if (adaptationSet.isVideo()) {
            this.setState({initialized: true, videoAdaptationSet: adaptationSet})
        } else if (adaptationSet.isAudio()) {
            this.setState({initialized: true, audioAdaptationSet: adaptationSet})
        } else if (adaptationSet.isText()) {
            this.setState({initialized: true, textAdaptationSet: adaptationSet})
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_SET_INITIALIZED, this.updateAdaptationSetFromEvent);

        if (!this.state.initialized) {
            return (<div></div>);
        } else {
            return (
                <div className={this.getClassForContainer()}>
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
    }
});

var RepresentationController = React.createClass({
    getInitialState: function () {
        return {
            representationNumber: 0,
            representationChanging: false
        };
    },

    updateSegmentIndexFromEvent: function (event) {
        if (event.value.mediaType === this.props.mediaType) {
            this.setState({
                currentSegment: event.value.currentSegment,
                maxSegment: event.value.maxSegment
            });
        }
    },

    createSegmentPropertyValue: function () {
        return this.state.currentSegment + "/" + this.state.maxSegment;
    },

    updateRepresentationFromEvent: function (event) {
        var representation = event.value;
        if (representation.getAdaptationSet().getMediaType() === this.props.mediaType) {
            this.setState({
                representationChanging: false,
                representationNumber: representation.orderNumber,
                id: representation.getId(),
                mimeType: representation.getMimeType(),
                codecs: representation.getCodecs(),
                bandwidth: representation.getBandwidth() + ' bps',
                width: representation.getWidth(),
                height: representation.getHeight(),
                frameRate: representation.getFrameRate() + ' fps',
                audioSamplingRate: representation.getAudioSamplingRate() + ' Hz'
            });
        }
    },

    buttonType: {
        LOWER: 0,
        HIGHER: 1
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
                    {this.state.currentSegment ?
                        <PropertyElement name='Segments' value={this.createSegmentPropertyValue()}/> : null}
                </div>
            );
        } else {
            return '';
        }
    },

    changeRepresentationToLower: function () {
        this.setState({representationChanging: true});
        dashPlayer.changeRepresentationToLower(this.props.mediaType, 1);
    },

    changeRepresentationToHigher: function () {
        this.setState({representationChanging: true});
        dashPlayer.changeRepresentationToHigher(this.props.mediaType, 1);
    },

    showAlertAboutChangingRepresentation: function () {
        if (this.state.representationChanging) {
            return (
                <div>
                    Representation is being changed
                </div>
            )
        } else {
            return '';
        }
    },

    shouldButtonBeDisabled: function (buttonType) {
        if (this.state.representationChanging || this.state.representationNumber === 0) {
            return true;
        }

        if (buttonType === this.buttonType.LOWER) {
            return this.state.representationNumber === 1;
        } else if (buttonType === this.buttonType.HIGHER) {
            return this.state.representationNumber === this.props.totalRepresentationsNumber;
        }
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_INITIALIZED, this.updateRepresentationFromEvent);
        eventBus.addEventListener(Dash.event.Events.REPRESENTATION_CHANGED, this.updateRepresentationFromEvent);
        eventBus.addEventListener(Dash.event.Events.SEGMENT_DOWNLOADED, this.updateSegmentIndexFromEvent);

        return (
            <div className="col-md-4">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <button onClick={this.changeRepresentationToLower}
                                disabled={this.shouldButtonBeDisabled(this.buttonType.LOWER)}>&lt;</button>

                        <span>{this.props.mediaType.name}</span>
                        <span>{this.state.representationNumber} / {this.props.totalRepresentationsNumber} </span>

                        <button onClick={this.changeRepresentationToHigher}
                                disabled={this.shouldButtonBeDisabled(this.buttonType.HIGHER)}>&gt;</button>
                    </div>
                    {this.showAlertAboutChangingRepresentation()}
                    <div className="panel-body">
                        {this.printRepresentationPropertiesIfInitialized()}
                    </div>
                </div>
            </div>
        );
    }
});


var LogContainer = React.createClass({

    logBufferSize: 1000,

    getInitialState: function () {
        return {logs: []};
    },

    onLog: function (event) {
        var logs = this.state.logs;
        logs.push({level: event.value.level, message: event.value.message});

        if (logs.length > this.logBufferSize) {
            logs.shift();
        }

        this.setState({logs: logs});
    },

    getClassForContainer: function () {
        var className = "logBody ";

        if (this.props.isActive) {
            className += "show";
        } else {
            className += "hidden";
        }
        return className;
    },

    componentDidUpdate: function () {
        var logBody = React.findDOMNode(this.refs.logs);
        logBody.scrollTop = logBody.scrollHeight;
    },

    render: function () {
        eventBus.addEventListener(Dash.event.Events.LOG_MESSAGE, this.onLog);

        var logMessages = this.state.logs.map(function (logEntry) {
            return (
                <li className="list-group-item"><LogMessage level={logEntry.level} message={logEntry.message}/></li>
            )
        });

        return (


            <div ref="logs" className={this.getClassForContainer()}>
                <ul className="list-group">
                    {logMessages}
                </ul>
            </div>

        );
    }
});

var LogMessage = React.createClass({

    createLabelElement: function () {
        switch (this.props.level) {
            case Dash.log.LogLevel.DEBUG:
                return (
                    <div>
                        <span className="label label-default">Debug</span>
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.INFO:
                return (
                    <span className="label label-info">Info</span>
                );
            case Dash.log.LogLevel.WARN:
                return (
                    <span className="label label-warning">Warning</span>
                );
            case Dash.log.LogLevel.ERROR:
                return (
                    <span className="label label-danger">Danger</span>
                );
        }
    },

    render: function () {
        switch (this.props.level) {
            case Dash.log.LogLevel.DEBUG:
                return (
                    <div >
                        <span className="label label-default">Debug</span>
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.INFO:
                return (
                    <div>
                        <span className="label label-info">Info</span>
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.WARN:
                return (
                    <div >
                        <span className="label label-warning">Warning</span>
                        {this.props.message}
                    </div>
                );
            case Dash.log.LogLevel.ERROR:
                return (
                    <div >
                        <span className="label label-danger">Danger</span>
                        {this.props.message}
                    </div>
                );
        }
    }
});





