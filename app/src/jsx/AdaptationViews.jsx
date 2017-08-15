var AdaptationProfileSetting = React.createClass({
    updateProfilePropertyCallback: function(prop, isCheckbox) {
        // one method controlling all profile settings by generating
        // dynamic callbacks for all of them
        var profile = this.props.container.state.activeProfile;
        var context = this.props.container;
        return function(event) {
            if (profile) {
                profile[prop] = isCheckbox ? event.target.checked : event.target.value;
                context.setState({}); // refresh ui only
            }
        };
    },
    render: function() {
        var container = this.props.container;
        var controlsDisabled = container.state.activeProfile ? false : true;
        var profile = container.state.activeProfile; // shorthand
        var isCheckbox = this.props.type == 'checkbox';
        var labelClasses = isCheckbox ? 'col-xs-11' : 'col-md-4 col-sm-6';
        var inputClasses = isCheckbox ? 'col-xs-1' : 'col-md-8 col-sm-6';
        var inputId = "adaptation-profile-".concat(this.props.field);
        switch (this.props.type) {
            case 'checkbox':
                input = <input id={inputId} type="checkbox" disabled={controlsDisabled}
                    checked={profile ? profile[this.props.field] : false} onChange={this.updateProfilePropertyCallback(this.props.field, true)}/>;
                break;
            case 'range':
                input = <input id={inputId} type="range" disabled={controlsDisabled} min={this.props.min} max={this.props.max}
                    value={profile ? profile[this.props.field] : 0}  onChange={this.updateProfilePropertyCallback(this.props.field, false)}/>;
                break;
            default:
                input = <input id={inputId} type={this.props.type} disabled={controlsDisabled}
                    value={profile ? profile[this.props.field] : ''} onChange={this.updateProfilePropertyCallback(this.props.field, isCheckbox)}
                    onBlur={container.onAdaptationProfilesUpdate}/>;
                break;
        }

        return (
            <div className="row">
                <div className={labelClasses}><label htmlFor={this.props.inputId}>{this.props.label}</label></div>
                <div className={inputClasses}>{input}</div>
            </div>
        );
    }
});

var PolicyConfigurationView = React.createClass({
    getInitialState: function() {
        return {profiles: [], activeProfile: null, activeProfileIndex: null};
    },
    onAdaptationProfilesUpdate: function() {
        this.setState({profiles: dashPlayer.adaptationManager.getProfileList()});
    },
    addProfile: function() {
        var name = prompt('Enter profile name');
        dashPlayer.adaptationManager.newProfile(name);
    },
    deleteProfile: function() {
        if (this.state.activeProfileIndex !== null) {
            dashPlayer.adaptationManager.deleteProfile(this.state.activeProfileIndex);
            this.clearSelectedProfile();
        }
        else {
            alert("No profile selected");
        }
    },
    clearSelectedProfile: function() {
        this.setState({activeProfileIndex: null, activeProfile: null});
    },
    selectProfile: function(event) {
        var index = event.target.value;
        var active = dashPlayer.adaptationManager.getProfile(index);
        this.setState({activeProfile: active,
                activeProfileIndex: index});
    },
    exportProfilesToFile: function() {
        var data = dashPlayer.adaptationManager.exportProfiles();
        var phantomLink = document.createElement('a');
        phantomLink.setAttribute('href', 'data:application/json,'+encodeURIComponent(data));
        phantomLink.setAttribute('download', 'dash-player-profiles.dat');

        phantomLink.click();
    },
    importProfilesFromFile: function() {
        // @TODO add checks for FileReader and block imports if not
        var phantomFile = document.createElement('input');
        phantomFile.setAttribute('type', 'file');
        phantomFile.addEventListener('change', function(e) {
            file = this.files[0];
            var reader = new FileReader();
            reader.onload = function(e) {
                if (!dashPlayer.adaptationManager.importProfiles(e.target.result)) {
                    alert('Unable to load profiles');
                }
            };
            reader.readAsText(file);
        });
        phantomFile.click();
    },
    render: function () {
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_PROFILES_UPDATE, this.onAdaptationProfilesUpdate);
        var controlsDisabled = this.state.activeProfile ? false : true;

        return (
            <div className="policy-configuration">
                <div className="row">
                    <div className="col-md-4 col-sm-6 adaptation-profile-list">
                        <h3>Stored profiles</h3>
                        <select size="2" onChange={this.selectProfile} value={this.state.activeProfileIndex}>
                            {this.state.profiles.map(function(profile, index) {
                                return (<option value={index}>{profile}</option>);
                            })}
                        </select>
                        <div className="row">
                        <div className="col-md-3 col-sm-6">
                        <button className="btn btn-primary profile-list-button" type="button" onClick={this.addProfile}>New</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn btn-danger" type="button" onClick={this.deleteProfile}>Delete</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn" type="button" onClick={this.importProfilesFromFile}>Import</button>
                </div>
                        <div className="col-md-3 col-sm-6">
                        <button className="btn" type="button" onClick={this.exportProfilesToFile}>Export</button>
                </div>
                        </div>
                    </div>
                    <div className="col-md-8 col-sm-6 adaptation-profile-settings">
                        <h3>Profile settings</h3>
                        <AdaptationProfileSetting container={this} type="text" field="name"
                            label="Profile name" />
                        <AdaptationProfileSetting container={this} type="range" field="tp"
                            label="How can you tolerate pauses in playback?" min="0" max="10" />
                        <AdaptationProfileSetting container={this} type="range" field="tc"
                            label="How frequent changes of quality can you tolerate?" min="0" max="10" />
                        <AdaptationProfileSetting container={this} type="checkbox" field="includeAmbientLight"
                            label="Do you allow ambient light level to affect video adaptation?" />
                        <AdaptationProfileSetting container={this} type="checkbox" field="includeAmbientSound"
                            label="Do you allow ambient sound level to affect audio adaptation?" />
                        <AdaptationProfileSetting container={this} type="checkbox" field="limitDataOnMobileNetwork"
                            label="Do you want to minimize data usage on mobile network?" />
                        <AdaptationProfileSetting container={this} type="checkbox" field="optimizeBattery"
                            label="Do you want us to propose adaptation strategy which allows to watch whole stream with current battery level?" />

                        <div className="row">
                            <div className="col-md-10 col-sm-8"></div>
                            <div className="col-md-2 col-sm-4">
                                <button className="btn btn-primary" onClick={this.props.wrapper.goToPlayer} disabled={controlsDisabled} >Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var ExternalConditionsEmulator = React.createClass({
    getInitialState: function() {
        return {visible: false};
    },
    render: function() {
        var classes = 'external-conditions-overlay '+(this.state.visible ? 'visible' : '');
        var intensityOptions = [];
        for (i=0; i<=10; i++) {
            intensityOptions.push(<option value={i*10}>{i*10}%</option>);
        }
        return (
            <div className={classes}>
    <span className="visibility-toggle" onClick={this.toggleVisibility}
        data-toggle="tooltip" data-placement="left" title="External conditions emulation"
    >&laquo;</span>
            <div className="panel panel-default">
              <div className="panel-heading">
              External conditions emulation
                <span className="visibility-close" onClick={this.toggleVisibility}>&times;</span>
              </div>
            <div className="panel-body">
            <p>
              This panel is used in pure web browser environments to provide
              adaptation engine with information about outside world. In mobile
              application this will be supplied by enclosing app. To be used
              for testing purposes.
              </p>
              <div className="form-group">
                <label for="ece-network">Current network type</label>
                <select id="ece-network" className="form-control">
                <option>Wi-Fi/Cable</option>
                <option>Mobile</option>
                </select>
              </div>
              <div className="form-group">
                <label for="ece-ambient-light">Ambient light intensity</label>
                <select id="ece-ambient-light" className="form-control">
                    {intensityOptions}
                </select>
              </div>
              <p>&hellip; and others if applicable</p>
            </div>
            </div>
            </div>
        );
    },
    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },
    toggleVisibility: function() {
        this.setState({visible: !this.state.visible});
    }
});
