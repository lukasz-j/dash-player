var PlayerView = React.createClass({
    getInitialState: function() {
        return {step: "adaptation_profile"};
    },
    render: function () {
        eventBus.addEventListener(Dash.event.Events.ENCLOSED_IN_APP_UPDATE, this.onEnclosedInAppUpdate);

        var enclosed = envAdapter.isEnclosedInApplication();

        return (
            <div className="container">
                {this.state.step === "adaptation_profile" ? <div className="adaptPolicyConfiguration">
                    <PolicyConfigurationView wrapper={this} />
                </div> : ''}

                {this.state.step === "player" ? <div className="player">
                    <SourceLoadView wrapper={this} />

                    <PlayerControllerPanel />

                    <DebugInfoPanel />
                </div> : '' }

                {!enclosed && <ExternalConditionsEmulator />}
            </div>
        );
    },
    goToPlayer: function() {
        // go to top before switching view, for smaller devices
        window.scrollTo(0, 0);
        this.setState({step: 'player'});
    },
    backToAdaptationProfile: function() {
        this.setState({step: 'adaptation_profile'});
    },
    onEnclosedInAppUpdate: function() {
        this.setState({}); // force re-render
    }
});

var SourceLoadView = React.createClass({

    youTubeURLRegex: '^((http|https):\/\/)?((www|m)\.)?youtu(be\.com|\.be)',

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

    loadVideoSource: function (event) {
        var sourceURL = React.findDOMNode(this.refs.sourceURL).value;
        dashPlayer.load(sourceURL, this.state.videoSource === 'youtube');
    },

    handleURLChange: function (event) {
        var url = event.target.value.trim(),
            youTubeRegex = new RegExp(this.youTubeURLRegex, 'i');

        if (youTubeRegex.test(url)) {
            this.setState({videoSource: 'youtube'});
        } else {
            this.setState({videoSource: 'mpd'});
        }
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
                    <div className="input-group">
                        <input type="text" className="form-control" ref="sourceURL" onChange={this.handleURLChange}
                               placeholder="YouTube movie or MPD file URL"/>
                        <span className="input-group-btn">
                            <button className="btn btn-primary" type="button" onClick={this.loadVideoSource}>
                                Load
                            </button>
                            <button className="btn btn-default" type="button" onClick={this.props.wrapper.backToAdaptationProfile}>
                                Back to profile
                            </button>
                        </span>
                    </div>
                </div>
                <div className="row">
                    {this.corsShouldBeEnabledAlert()}
                </div>
            </div>
        );
    }
});

var PropertyElement = React.createClass({
    render: function () {
        return (
            <div>{this.props.name} : {this.props.value.toString()} </div>
        )
    }
});







