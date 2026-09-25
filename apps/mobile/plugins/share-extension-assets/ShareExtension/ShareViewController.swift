import SwiftUI
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {
  private let viewModel = ShareViewModel()
  private var hostingController: UIHostingController<ShareRootView>?

  override func viewDidLoad() {
    super.viewDidLoad()

    let rootView = ShareRootView(
      viewModel: viewModel,
      onClose: { [weak self] in
        self?.closeExtension()
      },
      onOpenIapSettings: { [weak self] in
        self?.openIapSettingsInApp()
      }
    )

    let hosting = UIHostingController(rootView: rootView)
    addChild(hosting)
    view.addSubview(hosting.view)
    hosting.view.translatesAutoresizingMaskIntoConstraints = false

    NSLayoutConstraint.activate([
      hosting.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      hosting.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      hosting.view.topAnchor.constraint(equalTo: view.topAnchor),
      hosting.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])

    hosting.didMove(toParent: self)
    hostingController = hosting

    loadSharedText { [weak self] text in
      self?.viewModel.updateParagraph(text)
    }
  }

  private func closeExtension() {
    extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
  }

  private func openIapSettingsInApp() {
    openInHostApp(candidates: [
      "vocorbit://settings/iap",
      "vocorbit:///settings/iap",
      "com.vocorbit://settings/iap",
      "com.vocorbit:///settings/iap",
      "exp+vocorbit://settings/iap",
      "exp+vocorbit:///settings/iap",
    ])
  }

  private func openInHostApp(candidates: [String]) {
    func openCandidate(at index: Int) {
      guard index < candidates.count else { return }
      guard let url = URL(string: candidates[index]) else {
        openCandidate(at: index + 1)
        return
      }

      extensionContext?.open(url, completionHandler: { [weak self] success in
        guard let self else { return }
        if success {
          self.closeExtension()
          return
        }

        if index == candidates.count - 1 {
          self.openInHostAppViaResponderChain(candidates: candidates)
          return
        }

        openCandidate(at: index + 1)
      })
    }

    openCandidate(at: 0)
  }

  private func openInHostAppViaResponderChain(candidates: [String]) {
    let selector = NSSelectorFromString("openURL:")
    var responder: UIResponder? = self

    while let currentResponder = responder {
      if currentResponder.responds(to: selector) {
        for candidate in candidates {
          guard let url = URL(string: candidate) else { continue }
          _ = currentResponder.perform(selector, with: url)
        }
        return
      }
      responder = currentResponder.next
    }
  }

  private func loadSharedText(completion: @escaping (String?) -> Void) {
    guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil)
      return
    }

    for item in items {
      for provider in item.attachments ?? [] {
        if provider.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
          provider.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { object, _ in
            completion(object as? String)
          }
          return
        }

        if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
          provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { object, _ in
            completion((object as? URL)?.absoluteString)
          }
          return
        }
      }
    }

    completion(nil)
  }
}
