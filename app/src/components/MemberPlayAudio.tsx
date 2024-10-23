import React, { useEffect, useRef, useState } from 'react';
import { MemberItem } from './common';

export function MemberAudio({ member, onAudioElement }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [firstDisable, setFirstDisable] = useState(true)

  useEffect(() => {
    if (member.isMicrophoneEnabled) {
      onAudioElement(member, audioRef.current);
    } else if (!firstDisable) {
      onAudioElement(member, null);
      if (audioRef.current) {
        audioRef.current.srcObject = null;
        audioRef.current.src = '';
      }
    }
    setFirstDisable(false)
  }, [member.isMicrophoneEnabled]);

  return (
    <div className="member-audio">
      {member.isMicrophoneEnabled && (
        <audio ref={audioRef} id={`audio-${member.sfuId}`} />
      )}
    </div>
  );
}

function MemberAudioPlayGrid({ members, onAudioElement }) {
  const unused: MemberItem[] = members

  return (
    <div className="member-audio-list" style={{ display: 'none' }}>
      {members && members.map((member) => (
        <MemberAudio key={member.sfuId} member={member} onAudioElement={onAudioElement} />
      ))}
    </div>
  );
}

export default MemberAudioPlayGrid;
