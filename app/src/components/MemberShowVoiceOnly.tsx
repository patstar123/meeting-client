import '../styles/MemberShowVoiceOnly.css';

import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faUser } from '@fortawesome/free-solid-svg-icons';
import { ReactSVG } from 'react-svg';
import Slash from '../assets/icons/slash.svg';
import { MemberItem, createEmptyMemberItem, generateAvatar } from './common';

function VoiceMembersGrid({ members, maxCnt }) {
  const unused: MemberItem[] = members

  let displayedMembers = members
  if (members && members.length > maxCnt) {
    displayedMembers = members.slice(0, maxCnt);
    displayedMembers.push(createEmptyMemberItem())
  }

  return (
    <div className="voice-member-container">
      {displayedMembers && displayedMembers.map((member) => (
        <div className={`voice-member-item ${member.isSpeaking ? 'speaking' : ''}`} key={member.sfuId}>
          <span className="icon-stack">
            <img src={generateAvatar(member.name)} alt="speaker" />
            {member.isHost && (
              <div className="voice-member-host-icon-container">
                <FontAwesomeIcon icon={faUser} className="voice-member-host-icon" />
              </div>
            )}
          </span>

          <div className={`voice-member-name-container ${member.empty ? 'empty' : ''}`}>
            <span className="voice-member-name">{member.name + (member.isSelf ? '(自己)' : '')}</span>
            <span className="icon-stack">
              <FontAwesomeIcon icon={faMicrophone} className="voice-member-mic-icon" />
              {!member.isMicrophoneEnabled && <ReactSVG src={Slash} className="voice-member-mic-icon-slash" />}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default VoiceMembersGrid;
