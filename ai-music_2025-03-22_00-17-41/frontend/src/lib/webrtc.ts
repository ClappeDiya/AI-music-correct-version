type PeerConnection = {
  connection: RTCPeerConnection;
  stream: MediaStream;
};

export class WebRTCManager {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onParticipantJoined: (peerId: string) => void = () => {};
  private onParticipantLeft: (peerId: string) => void = () => {};
  private onTrackAdded: (peerId: string, stream: MediaStream) => void =
    () => {};

  constructor(
    private iceServers: RTCIceServer[],
    private signalingUrl: string,
  ) {}

  async initialize(
    onParticipantJoined: (peerId: string) => void,
    onParticipantLeft: (peerId: string) => void,
    onTrackAdded: (peerId: string, stream: MediaStream) => void,
  ) {
    this.onParticipantJoined = onParticipantJoined;
    this.onParticipantLeft = onParticipantLeft;
    this.onTrackAdded = onTrackAdded;

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    } catch (error) {
      console.error("Failed to get user media:", error);
      throw error;
    }
  }

  async createPeerConnection(peerId: string): Promise<void> {
    const connection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          connection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage(peerId, {
          type: "ice-candidate",
          candidate: event.candidate,
        });
      }
    };

    // Handle remote tracks
    connection.ontrack = (event) => {
      const stream = new MediaStream();
      event.streams[0].getTracks().forEach((track) => {
        stream.addTrack(track);
      });
      this.onTrackAdded(peerId, stream);
    };

    this.peerConnections.set(peerId, {
      connection,
      stream: this.localStream!,
    });
  }

  async handleSignalingMessage(message: any) {
    const { type, from, data } = message;

    if (!this.peerConnections.has(from)) {
      await this.createPeerConnection(from);
      this.onParticipantJoined(from);
    }

    const peerConnection = this.peerConnections.get(from)!;

    switch (type) {
      case "offer":
        await peerConnection.connection.setRemoteDescription(
          new RTCSessionDescription(data),
        );
        const answer = await peerConnection.connection.createAnswer();
        await peerConnection.connection.setLocalDescription(answer);
        this.sendSignalingMessage(from, {
          type: "answer",
          sdp: answer,
        });
        break;

      case "answer":
        await peerConnection.connection.setRemoteDescription(
          new RTCSessionDescription(data),
        );
        break;

      case "ice-candidate":
        await peerConnection.connection.addIceCandidate(
          new RTCIceCandidate(data),
        );
        break;

      case "leave":
        this.removePeerConnection(from);
        this.onParticipantLeft(from);
        break;
    }
  }

  private async sendSignalingMessage(to: string, data: any) {
    try {
      await fetch(this.signalingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          data,
        }),
      });
    } catch (error) {
      console.error("Failed to send signaling message:", error);
    }
  }

  removePeerConnection(peerId: string) {
    const peer = this.peerConnections.get(peerId);
    if (peer) {
      peer.connection.close();
      this.peerConnections.delete(peerId);
    }
  }

  async startCall(peerId: string) {
    if (!this.peerConnections.has(peerId)) {
      await this.createPeerConnection(peerId);
    }

    const peerConnection = this.peerConnections.get(peerId)!;
    const offer = await peerConnection.connection.createOffer();
    await peerConnection.connection.setLocalDescription(offer);

    this.sendSignalingMessage(peerId, {
      type: "offer",
      sdp: offer,
    });
  }

  setMuted(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  cleanup() {
    this.peerConnections.forEach((peer, peerId) => {
      this.removePeerConnection(peerId);
    });
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
  }
}
