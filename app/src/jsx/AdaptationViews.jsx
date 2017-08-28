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
        Dash.utils.CommonUtils.downloadAsFile('dash-player-profiles.dat', data);
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
    goToPlayer: function() {
        if (this.state.activeProfileIndex) {
            if (dashPlayer.adaptationManager.setActiveProfile(this.state.activeProfileIndex)) {
                this.props.wrapper.goToPlayer();
            }
            else {
                alert("Unable to set profile");
            }
        }
        else {
            alert("No profile selected");
        }
    },
    render: function () {
        eventBus.addEventListener(Dash.event.Events.ADAPTATION_PROFILES_UPDATE, this.onAdaptationProfilesUpdate);
        var controlsDisabled = this.state.activeProfile ? false : true;
        // when enclosed in app, render single-line, small select
        // as mobile browsers use native dropdown control anyway.
        var enclosed = envAdapter.isEnclosedInApplication();
        var selectClasses = enclosed ? "" : "expanded-profile-list";
        var profileButtonClasses = enclosed ? "col-sm-6" : "col-md-3 col-sm-6";

        return (
            <div className="policy-configuration">
                <div className="row">
                    <div className="col-md-4 col-sm-6 adaptation-profile-list">
                        <h3>Stored profiles</h3>
                        <select size="2" className={selectClasses} onChange={this.selectProfile} value={this.state.activeProfileIndex}>
                            {this.state.profiles.map(function(profile, index) {
                                return (<option value={index}>{profile}</option>);
                            })}
                        </select>
                        <div className="row">
                        <div className={profileButtonClasses}>
                        <button className="btn btn-primary profile-list-button" type="button" onClick={this.addProfile}>New</button>
                </div>
                        <div className={profileButtonClasses}>
                        <button className="btn btn-danger" type="button" onClick={this.deleteProfile}>Delete</button>
                </div>
                {!enclosed &&
                        <div className={profileButtonClasses}>
                        <button className="btn" type="button" onClick={this.importProfilesFromFile}>Import</button>
                </div>}
                {!enclosed &&
                        <div className={profileButtonClasses}>
                        <button className="btn" type="button" onClick={this.exportProfilesToFile}>Export</button>
                </div>}
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
                                <button className="btn btn-primary" onClick={this.goToPlayer} disabled={controlsDisabled} >Done</button>
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
    changeCallback: function(condition) {
        return function(event) {
            var value = event.target.value;
            if (value === '') {
                value = null;
            }
            dashPlayer.adaptationManager.conditionsHolder.setExternalCondition(condition, value);
        };
    },
    batteryChangeCallback: function(interval, drop) {
        var select = this.refs.batteryLevel;
        var emulator = this;
        return function(event) {
            var initial = select.getDOMNode().value;
            dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryLevel', initial);
            if (interval === 0) {
                dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryDischarging', false);
            }
            else {
                // interval = -1 for discharging with fixed value
                dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryDischarging', true);
                if (interval > 0) {
                    emulator.stopBatterySimulator();
                    window.batterySimulator = Dash.adaptation.BatteryDischargingSimulator(interval, drop);
                }
            }
        };
    },
    stopBatterySimulator: function() {
        if (window.batterySimulator) {
            window.batterySimulator.stop();
            delete window.batterySimulator;
        }
    },
    cancelBatterySetting: function(event) {
        this.stopBatterySimulator();
        dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryLevel', null);
        dashPlayer.adaptationManager.conditionsHolder.setExternalCondition('batteryDischarging', null);
    },
    render: function() {
        var classes = 'external-conditions-overlay '+(this.state.visible ? 'visible' : '');
        var percentIntensityOptions = [<option></option>];
        for (i=0; i<=10; i++) {
            percentIntensityOptions.push(<option value={i*10}>{i*10}%</option>);
        }
        var soundIntensityOptions = [<option></option>];
        for (i=20; i<=90; i+=10) {
            soundIntensityOptions.push(<option value={i}>{i} dB</option>);
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
                <label htmlFor="ece-network">Current network type</label>
                <select id="ece-network" className="form-control" onChange={this.changeCallback('networkType')}>
                <option></option>
                <option value="wifi">Wi-Fi/Cable</option>
                <option value="mobile">Mobile</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ece-ambient-light">Ambient light intensity</label>
                <select id="ece-ambient-light" className="form-control" onChange={this.changeCallback('ambientLight')}>
                    {percentIntensityOptions}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ece-ambient-sound">Ambient sound intensity</label>
                <select id="ece-ambient-sound" className="form-control" onChange={this.changeCallback('ambientSound')}>
                    {soundIntensityOptions}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ece-battery-level">Battery level</label>
                <div className="input-group">
                <select id="ece-battery-level" className="form-control" ref="batteryLevel">
                    {percentIntensityOptions}
                </select>
                <div className="input-group-btn">
                <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Action&hellip;</button>
                    <ul className="dropdown-menu dropdown-menu-right">
                        <li><a onClick={this.batteryChangeCallback(0, 0)}>Fixed value, "charging" status</a></li>
                        <li><a onClick={this.batteryChangeCallback(-1, 0)}>Fixed value, "not charging" status</a></li>
                        <li role="separator" className="divider"></li>
                        <li><a onClick={this.batteryChangeCallback(60, 1)}>Discharge at 1% per minute</a></li>
                        <li><a onClick={this.batteryChangeCallback(20, 1)}>Discharge at 3% per minute</a></li>
                        <li><a onClick={this.batteryChangeCallback(180, 1)}>Discharge at 1% per 3 minutes</a></li>
                        <li><a onClick={this.batteryChangeCallback(600, 1)}>Discharge at 1% per 10 minutes</a></li>
                        <li role="separator" className="divider"></li>
                        <li><a onClick={this.cancelBatterySetting}>Cancel</a></li>
                    </ul>
                </div>
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
    toggleVisibility: function() {
        this.setState({visible: !this.state.visible});
    }
});
